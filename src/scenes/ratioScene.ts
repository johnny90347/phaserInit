import Phaser from 'phaser'
import { game } from '../main'
import { AlignGrid } from '../alignGrid'

interface ContainerModle {
    container: Phaser.GameObjects.Container;
    isDone: boolean; // 此容器被按下停止按鈕
}

// isExpired: boolean; // 是否已經過期(水果移動超過空間的一半會被標記為過期)

export default class RatioScene extends Phaser.Scene {

    gameScreenWidth = 0;
    gameScreenHeight = 0;

    slotBoxList: ContainerModle[] = [];
    slotBoxWidth = 0; // 角子機box寬
    slotBoxHeight = 0; // 角子機box的長
    slotMachine: Phaser.GameObjects.Sprite // 角子機的圖案

    timer: any; // 自動依序停止的timer
    finishSlotBox = 0; // 已經結束動作的container
    alignGrid: AlignGrid; // 網格的class
    slotDropSpeed = 0;
    machineIsRun = false; // 機器現在有沒有在跑
    round = 0;// 機器已經跑了幾回合
    maxCanRunRound = 100;//最多可以讓他跑幾回合;(可以抽幾次獎項)

    constructor() {
        super('HomeScene')
    }

    preload() {
        this.load.image('slot-machine', 'assets/slot-machine.png');
        this.load.spritesheet('button', 'assets/button.png', { frameWidth: 374, frameHeight: 127 });
        this.load.spritesheet('slot-machine-sprite', 'assets/slot-machine-sprite.png', { frameWidth: 502, frameHeight: 308 })

        this.load.image('bar', 'assets/bar.png');
        this.load.image('bell', 'assets/bell.png');
        this.load.image('cherry', 'assets/cherry.png');
        this.load.image('diamond', 'assets/diamond.png');
        this.load.image('grape', 'assets/grape.png');
        this.load.image('orange', 'assets/orange.png');
        this.load.image('seven', 'assets/seven.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('watermelon', 'assets/watermelon.png');

    }
    create() {
        // 基礎設定
        this.gameScreenWidth = +game.config.width;
        this.gameScreenHeight = +game.config.height;
        this.slotDropSpeed = +game.config.height; // 高度跟掉落速度設定一樣
        // 建立物件
        // 角子機
        this.createSlotMachine();
        // 角子機內滾動的盒子
        this.createSlotBox();
        // 開始按鈕
        this.createButton(18, '开始', (() => {
            this.allBoxStartRun();
        }));
        // 停止按鈕
        this.createButton(16, '全部停止', (() => {
            this.allStopImmediately()
        }));
    }
    update() {
        this.slotBoxList.map((obj: ContainerModle) => {
            // 只要在容器內所有的item 都要移動
            obj.container.list.map((item: Phaser.Physics.Arcade.Sprite) => {
                const itemHalfHeight = item.height / 2;

                // @ts-ignore
                if (item.haveToStop == true) {
                    const centerYPostion = obj.container.height / 2;
                    const centerXPostion = obj.container.width / 2;
                    if (item.y < centerYPostion) {
                        if (centerYPostion - item.y < 4) {
                            // 停止了之後,完成的container 加1,如果已經加到3 代表要結算成績了
                            item.body.reset(centerXPostion, centerYPostion);
                            this.finishSlotBox += 1;
                            if (this.finishSlotBox === 3) {
                                //全部都跑完了
                                this.machineIsRun = false;
                                // 要結算成績
                                this.calculateResult();
                            }

                        }
                    }
                }

                // 物品超過容器中央,標記為過期
                if (item.y > obj.container.height / 2) {
                    // 並加入新物件
                    if (obj.container.list.length < 2) {
                        // 已經被按下停止鈕
                        if (obj.isDone) {
                            this.addItemToBox(obj.container, this.slotBoxWidth / 2, -this.slotBoxHeight / 2, true, true);
                        } else {
                            this.addItemToBox(obj.container, this.slotBoxWidth / 2, -this.slotBoxHeight / 2, false, true);
                        }
                    }
                }
                // 物品完全跑出畫面時,銷毀
                if (item.y > obj.container.height + itemHalfHeight) {
                    item.destroy()
                }
            })

        })

    }

    /** 畫一格矩行框框 */
    drawRectLine(x: number, y: number, width: number, height: number, color: any, alpha: number): Phaser.GameObjects.Graphics {
        var graphics = this.add.graphics(); // graphics 是繪製基本圖型的方法
        var thickness = 2;
        graphics.lineStyle(thickness, color, alpha); // 線條的樣式
        graphics.strokeRect(x, y, width, height);
        return graphics;
    }

    /** 畫一個矩行充滿顏色的框框 */
    drawFillRect(x: number, y: number, width: number, height: number, color: any, alpha: number): Phaser.GameObjects.Graphics {
        var graphics = this.add.graphics();
        graphics.fillStyle(color, alpha);
        graphics.fillRect(x, y, width, height);
        return graphics;
    }

    /** 創造一個基本按鈕 */
    createButton(placeIndex: number, title: string, onTap: Function) {
        var container = this.add.container(0, 0)
        this.alignGrid.placeAtIndex(placeIndex, container);

        const actionButton = this.add.sprite(0, 0, 'button', 0);
        this.alignGrid.scaleToGridWidth(actionButton);

        var fontSize = '16px';
        if (this.gameScreenWidth <= 400) {
            fontSize = '12px';
        }

        const actionButtonText = this.add.text(0, 0, title, { fill: '#000000', fontSize: fontSize });
        container.add(actionButton);
        container.add(actionButtonText);
        actionButtonText.setOrigin(0.5, 0.5)
        actionButton.setInteractive();
        actionButton.on('pointerdown', () => {
            actionButton.setFrame(1);
            onTap();
        });
        actionButton.on('pointerup', () => {
            actionButton.setFrame(0);
        });
    }
    /** 建立角子機的機器圖案 */
    createSlotMachine() {
        const gridConfig = {
            'scene': this,
            'cols': 5,
            'rows': 4,
            'gameHeight': this.gameScreenHeight,
            'gameWidth': this.gameScreenWidth
        }

        this.slotMachine = this.add.sprite(0, 0, 'slot-machine-sprite');
        this.anims.create({
            key: 'action',
            frames: [
                { key: 'slot-machine-sprite', frame: 0 },
                { key: 'slot-machine-sprite', frame: 1 },
                { key: 'slot-machine-sprite', frame: 2 },
                { key: 'slot-machine-sprite', frame: 1 },
                { key: 'slot-machine-sprite', frame: 0 },
                // { key: 'slot-machine-sprite', frame: 3 },
            ],
            frameRate: 8,
            repeat: 0
        })


        this.alignGrid = new AlignGrid(gridConfig);
        this.alignGrid.showGridNumber();
        this.alignGrid.placeAtIndex(7, this.slotMachine);
        this.alignGrid.scaleToNMultipleGridHeight(this.slotMachine, 3)

        this.drawRectLine(this.slotMachine.x - this.slotMachine.displayWidth / 2, this.slotMachine.y - this.slotMachine.displayHeight / 2, this.slotMachine.displayWidth, this.slotMachine.displayHeight, 0xff32c98d, 1);
    }

    /** 產生讓水果滾動的Box (需要三個) */
    createSlotBox() {
        for (let i = 0; i < 3; i++) {
            this.generateBox(i);
        }
    }

    /** 新增一個矩型容器+遮罩 */
    generateBox(index: number) {
        // 整台機器(照片)的最左上角位置(以這邊為原點做計算)
        const originX = this.slotMachine.x - this.slotMachine.displayWidth / 2;
        const originY = this.slotMachine.y - this.slotMachine.displayHeight / 2;
        const machineWidth = this.slotMachine.displayWidth;
        const machineHeight = this.slotMachine.displayHeight;

        const boxWidth = machineWidth * (1.50 / 9.1);
        const boxHeight = machineHeight * (2.5 / 5.8);
        //設置container
        var newSlotBox = this.add.container(originX + machineWidth * (1.7 / 9.1) + (machineWidth * (0.48 / 9.1) + boxWidth) * index, originY + (machineHeight * (2 / 5.8)));
        newSlotBox.width = boxWidth;
        newSlotBox.height = boxHeight;
        this.slotBoxWidth = boxWidth; // box 寬度拿上去
        this.slotBoxHeight = boxHeight; // box 高度拿上去

        // 設置圖片加入container
        this.addItemToBox(newSlotBox, boxWidth / 2, boxHeight / 2, true, false);
        // 產生矩行遮罩的位置及大小
        const graphics = this.drawFillRect(newSlotBox.x, newSlotBox.y, newSlotBox.width, newSlotBox.height, 0xffffff, 0);
        this.drawRectLine(newSlotBox.x, newSlotBox.y, newSlotBox.width, newSlotBox.height, 0xffffff, 1);
        // 將box加入遮罩
        newSlotBox.mask = new Phaser.Display.Masks.GeometryMask(this, graphics); // 容器加入遮罩
        var obj = {
            container: newSlotBox,
            isDone: false
        }
        this.slotBoxList.push(obj);
    }

    /** 將item加入容器 */
    addItemToBox(container: Phaser.GameObjects.Container, x: number, y: number, haveToStop: boolean, autoMove: boolean) {
        const keyList = [{
            key: 'orange',
            odds: 1,
            id: 0
        },
        {
            key: 'grape',
            odds: 2,
            id: 1
        },
        {
            key: 'watermelon',
            odds: 3,
            id: 2
        },
        {
            key: 'cherry',
            odds: 5,
            id: 3
        },
        {
            key: 'star',
            odds: 10,
            id: 4
        },
        {
            key: 'diamond',
            odds: 20,
            id: 5
        },
        {
            key: 'bar',
            odds: 50,
            id: 6
        },
        {
            key: 'bell',
            odds: 250,
            id: 7
        },
        {
            key: 'seven',
            odds: 750,
            id: 8
        }];
        const randomIndex = Math.floor(Math.random() * 9); // 隨機產生0~8
        var item = this.physics.add.sprite(x, y, keyList[randomIndex].key);
        item.displayHeight = this.slotBoxWidth * 0.8; // 設置寬 為容器寬的一半
        item.scaleX = item.scaleY // 等比縮放
        // 加入賠率跟Id
        // @ts-ignore
        item.odds = keyList[randomIndex].odds;
        // @ts-ignore
        item.id = keyList[randomIndex].id;
        // @ts-ignore    
        item.id = keyList[randomIndex].key;
        // @ts-ignore
        item.haveToStop = haveToStop; //這個物件是不是要停下來的
        container.add(item);// 加入容器
        // 新增出來的物件直接都會往下掉,但不會停

        if (autoMove == true) {
            this.physics.moveTo(item, container.width / 2, 200, this.slotDropSpeed);
        }
    }

    /** 所有container內物件開始移動 */
    allBoxStartRun() {
        if (this.machineIsRun == true) { return }
        if (this.round >= this.maxCanRunRound) {
            console.log('超過最多可以轉的次數了');
            return;
        }
        this.slotMachine.play('action');
        this.round += 1;
        this.finishSlotBox = 0;// 歸零
        this.machineIsRun = true;

        this.slotBoxList.map((obj: ContainerModle) => {
            obj.isDone = false
            obj.container.list.map((item: Phaser.Physics.Arcade.Sprite) => {
                this.physics.moveTo(item, obj.container.width / 2, 200, this.slotDropSpeed);
            })
        })
        // 2秒後 如果是同一回合,要自動停
        this.timer = setTimeout(() => {
            this.allStopInorder()
        }, 2000);
    }

    /** 全部container依序停止 */
    allStopInorder() {
        let index = 0;
        let interval = setInterval(() => {
            if (index < 3) {
                this.stopSingleBoxScroll(this.slotBoxList[index]);
                index += 1;
            } else {
                clearInterval(interval);
            }
        }, 300);
    }


    /** 全部container 馬上停止 */
    allStopImmediately() {
        clearTimeout(this.timer);
        this.slotBoxList.map((obj: ContainerModle) => {
            this.stopSingleBoxScroll(obj);
        })
    }

    // 單一container內物件停止
    stopSingleBoxScroll(obj: ContainerModle) {
        obj.isDone = true
    }

    /** 結算成績 */
    calculateResult() {
        var tempItem = [];
        this.slotBoxList.map((obj: ContainerModle) => {
            obj.container.list.map((item: Phaser.Physics.Arcade.Sprite) => {
                if (tempItem.length == 0) {// 第一個值先存進入
                    tempItem.push(item);
                    return;
                }
                // id跟存進去的一樣就push進去
                // @ts-ignore
                if (tempItem.length != 0 && tempItem[0].id == item.id) {
                    tempItem.push(item);
                    return;
                }
            })
        })
        // 裡面有放滿3個就是中獎了
        if (tempItem.length == 3) {
            console.log('中獎拉');
            console.log('項目', tempItem[0].key)
            console.log('倍率', tempItem[0].odds)
        } else {
            console.log('沒中獎')
        }

    }
}