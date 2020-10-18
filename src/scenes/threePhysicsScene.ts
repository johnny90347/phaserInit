import Phaser from 'phaser'
import { game } from '../main'
import { AlignGrid } from '../alignGrid'
import { createJSDocThisTag } from 'typescript';

interface ContainerModle {
    container: Phaser.GameObjects.Container;
    isDone: boolean; // 此容器被按下停止按鈕
}


export default class ThreePhysicsScene extends Phaser.Scene {

    gameScreenWidth = 0;
    gameScreenHeight = 0;

    slotBoxList: Phaser.GameObjects.Container[] = [];
    slotBoxWidth = 0; // 角子機box寬
    slotBoxHeight = 0; // 角子機box的長
    slotMachine: Phaser.GameObjects.Sprite // 角子機的圖案
    itemHeight = 0;//水果物件的寬

    timer: any; // 自動依序停止的timer
    finishSlotBox = 0; // 已經結束動作的container
    alignGrid: AlignGrid; // 網格的class
    slotDropSpeed = 0;
    machineIsRun = false; // 機器現在有沒有在跑
    round = 0;// 機器已經跑了幾回合
    maxCanRunRound = 100;//最多可以讓他跑幾回合;(可以抽幾次獎項)

    // 檢查點族群

    addItemCheckPointGroup: Phaser.GameObjects.Group;
    deleteCheckPointGroup: Phaser.GameObjects.Group;
    firstFloorCheckPointGroup: Phaser.GameObjects.Group; // 第一層
    markCheckPointGroup: Phaser.GameObjects.Group;// 第二層(我們要的)
    lastFloorCheckPointGroup: Phaser.GameObjects.Group;// 第三層

    //最大重力
    gravityValue = 540;

    machineTapStop = false;//已經被按下停止了嗎?
    stopStep = 0; //停止步驟


    // 結果
    resultList: Phaser.Physics.Arcade.Sprite[] = [];
    // 所有的item不只結果 ,為了給全部速度讓他開始跑
    allItemList: Phaser.Physics.Arcade.Sprite[] = [];

    constructor() {
        super('HomeScene')
    }

    init() {
        console.log('the initializer');
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
        this.load.image('check-point', 'assets/check-point.png');

    }
    create() {

        this.gameScreenWidth = +game.config.width;
        this.gameScreenHeight = +game.config.height;
        // 建立網格
        const gridConfig = {
            'scene': this,
            'cols': 5,
            'rows': 4,
            'gameHeight': this.gameScreenHeight,
            'gameWidth': this.gameScreenWidth
        }
        this.alignGrid = new AlignGrid(gridConfig);

        // 建立物件
        //生成group 碰撞用
        this.markCheckPointGroup = this.add.group();
        this.addItemCheckPointGroup = this.add.group();
        this.deleteCheckPointGroup = this.add.group();
        this.firstFloorCheckPointGroup = this.add.group();
        this.lastFloorCheckPointGroup = this.add.group();

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
            ],
            frameRate: 8,
            repeat: 0
        })

        this.alignGrid.placeAtIndex(7, this.slotMachine);
        this.alignGrid.scaleToNMultipleGridHeight(this.slotMachine, 3)

        // this.drawRectLine(this.slotMachine.x - this.slotMachine.displayWidth / 2, this.slotMachine.y - this.slotMachine.displayHeight / 2, this.slotMachine.displayWidth, this.slotMachine.displayHeight, 0xff32c98d, 1);
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
        this.itemHeight = boxHeight * 0.3; // 設置圖片需要的高度

        //加入檢查點,不可動

        const addItemCheckPoint = this.physics.add.image(boxWidth / 2, boxHeight + this.itemHeight, 'check-point');
        const deleteCheckPoint = this.physics.add.image(boxWidth / 2, boxHeight + this.itemHeight + 20, 'check-point');
        const firstFloorCheckPoint = this.physics.add.image(boxWidth / 2, boxHeight * 0.25, 'check-point'); // 第一個佔25%
        const markCheckPoint = this.physics.add.image(boxWidth / 2, boxHeight * 0.75, 'check-point'); // 第二個佔50%
        const lastFloorCheckPoint = this.physics.add.image(boxWidth / 2, boxHeight + this.itemHeight - 10, 'check-point'); // 第三個佔25%
        // 注意 ,最下面有三個檢查點,幾乎重疊,由上而下分別是
        // 1. 反彈點
        // 2. 新增點
        // 3. 刪除點

        addItemCheckPoint.displayWidth = boxWidth;
        deleteCheckPoint.displayWidth = boxWidth;
        firstFloorCheckPoint.displayWidth = boxWidth;
        markCheckPoint.displayWidth = boxWidth;
        lastFloorCheckPoint.displayWidth = boxWidth;

        addItemCheckPoint.setImmovable();
        deleteCheckPoint.setImmovable();
        firstFloorCheckPoint.setImmovable();
        markCheckPoint.setImmovable();
        lastFloorCheckPoint.setImmovable();

        addItemCheckPoint.visible = false;
        deleteCheckPoint.visible = false;
        firstFloorCheckPoint.visible = false;
        markCheckPoint.visible = false;
        lastFloorCheckPoint.visible = false;

        this.addItemCheckPointGroup.add(addItemCheckPoint);
        this.deleteCheckPointGroup.add(deleteCheckPoint);
        this.firstFloorCheckPointGroup.add(firstFloorCheckPoint);
        this.markCheckPointGroup.add(markCheckPoint);
        this.lastFloorCheckPointGroup.add(lastFloorCheckPoint);

        newSlotBox.add(addItemCheckPoint);
        newSlotBox.add(deleteCheckPoint);
        newSlotBox.add(firstFloorCheckPoint);
        newSlotBox.add(markCheckPoint);
        newSlotBox.add(lastFloorCheckPoint);

        this.slotBoxList.push(newSlotBox);
        this.addItemToBox(index, newSlotBox, true);

        // 產生矩行遮罩的位置及大小
        const graphics = this.drawFillRect(newSlotBox.x, newSlotBox.y, newSlotBox.width, newSlotBox.height, 0xffffff, 0);
        // this.drawRectLine(newSlotBox.x, newSlotBox.y, newSlotBox.width, newSlotBox.height, 0xffffff, 1);
        // 將box加入遮罩
        newSlotBox.mask = new Phaser.Display.Masks.GeometryMask(this, graphics); // 容器加入遮罩

    }

    /** 將item加入容器 */
    addItemToBox(index: number, container: Phaser.GameObjects.Container, isFirstCreated: boolean) {
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

        const boxWidth = container.width;
        const boxHeight = container.height;
        let loopTime = 1; // 非初期建立 = 指生成一個物件,初期建立 = 生成三個物件,且排法不同
        if (isFirstCreated === true) {
            loopTime = 3;
        }

        for (let i = 0; i < loopTime; i++) {
            const randomIndex = Math.floor(Math.random() * 9); // 隨機產生0~8
            var item: Phaser.Physics.Arcade.Sprite;
            if (isFirstCreated === true) {
                item = this.physics.add.sprite(boxWidth / 2, 0 + (boxHeight / 2 * i), keyList[randomIndex].key);
            } else {
                item = this.physics.add.sprite(boxWidth / 2, -(boxHeight / 2 - this.itemHeight / 2), keyList[randomIndex].key);
            }

            item.displayHeight = this.itemHeight; // 設置寬 為容器寬的一半
            item.scaleX = item.scaleY // 等比縮放
            item.setBounceY(0)
            // 第一次建立沒速度
            if (isFirstCreated === true) {
                item.setVelocityY(0)
                this.allItemList.push(item);
            } else {
                item.setVelocityY(this.gravityValue)
            }

            // 加入賠率跟Id
            // @ts-ignore
            item.odds = keyList[randomIndex].odds;
            // @ts-ignore
            item.id = keyList[randomIndex].id;
            // @ts-ignore    
            item.key = keyList[randomIndex].key;
            // @ts-ignore
            item.containerIndex = index; // 因為下面push到結果欄時,無法保證他的順序,所以加個index判斷它是屬於哪個container,以備不時之需

            container.add(item);// 加入容器

            //增加碰撞條件, 每個碰到刪除點 都要消失
            this.physics.add.collider(item, this.deleteCheckPointGroup, ((item) => { item.destroy() }));
            // 增加碰撞條件, 每個碰到新增點 都要新增一個item
            const overlap = this.physics.add.overlap(item, this.addItemCheckPointGroup, ((item: Phaser.Physics.Arcade.Sprite) => {
                overlap.destroy();
                this.addItemToBox(index, container, false);
            }));

            // // 如果是下停止鈕,那要增加第一個檢查點的碰撞   
            if (this.machineTapStop === true) {
                var tempGroup: Phaser.GameObjects.Group;
                if (this.stopStep < 3) {
                    tempGroup = this.lastFloorCheckPointGroup;
                    this.stopStep += 1;
                } else if (this.stopStep < 6) {
                    tempGroup = this.markCheckPointGroup;
                    this.stopStep += 1;
                } else if (this.stopStep < 8) {
                    tempGroup = this.firstFloorCheckPointGroup;
                    this.stopStep += 1;
                } else if (this.stopStep === 8) {
                    tempGroup = this.firstFloorCheckPointGroup;
                    this.stopStep = 0;
                }

                const collider = this.physics.add.collider(item, tempGroup, ((item: Phaser.Physics.Arcade.Sprite) => {
                    //碰到後做動畫    //y =y原本的位置 - 盒子的一半的一半 + 自己item高的一半 
                    var yPosition = 0;
                    if (tempGroup === this.markCheckPointGroup) {
                        yPosition = boxHeight / 2;
                    } else if (tempGroup === this.lastFloorCheckPointGroup) {
                        yPosition = boxHeight;
                    }

                    this.add.tween({
                        targets: item, duration: 200, x: container.width / 2, y: yPosition, onComplete: (() => {
                            // 動畫完成後的callBack
                            // 跑在markGroup的才需要丟進結果
                            if (tempGroup === this.markCheckPointGroup) {
                                this.resultList.push(item);
                                // 結果欄有三個代表都跑完了,結算
                                if (this.resultList.length === 3) {
                                    console.log('回合完成');
                                    console.log('結算瞜');
                                    this.calculateResult();

                                }
                            }
                        })
                    }); // 最下面會有個10的偏差我就先不管
                    this.allItemList.push(item);
                    item.setVelocityY(0);
                    collider.destroy();
                }));
            }
        }
    }

    /** 所有container內物件開始移動 */
    allBoxStartRun() {
        if (this.machineIsRun === true) { return; }
        this.machineIsRun = true;
        this.slotMachine.play('action');
        this.machineTapStop = false;
        this.allItemList.map((item: Phaser.Physics.Arcade.Sprite) => {
            item.setVelocityY(this.gravityValue);
        })

        // 所有的item 陣列清空
        this.resultList = [];
        this.allItemList = [];
    }

    /** 全部container 馬上停止 */
    allStopImmediately() {
        if (this.machineIsRun === false) { return; }
        this.machineTapStop = true;
    }
    /** 全部container依序停止 */
    allStopInorder() {

    }
    // 單一container內物件停止
    stopSingleBoxScroll(obj: ContainerModle) {
        obj.isDone = true
    }

    /** 結算成績 */
    calculateResult() {
        //@ts-ignore
        const baseItem = this.resultList[0];// 基準值
        var sameItems = []; // 與基準值比對.相同的存進去
        var animationAmount = 0;

        //開始比對
        this.resultList.forEach((item: Phaser.Physics.Arcade.Sprite) => {
            //@ts-ignore
            if (item.id === baseItem.id) {
                sameItems.push(item)
            }
        });

        // 有三個代表中獎拉
        if (sameItems.length === 3) {
            //@ts-ignore
            console.log('中獎內容', baseItem.key);
            //@ts-ignore
            console.log('中獎倍數', baseItem.odds);
            this.resultList.forEach((item: Phaser.Physics.Arcade.Sprite) => {
                this.add.tween({
                    targets: item, duration: 300, scaleX: item.scaleX * 1.5, scaleY: item.scaleY * 1.5, onComplete: (() => {
                        this.add.tween({
                            targets: item, duration: 300, scaleX: item.scaleX / 1.5, scaleY: item.scaleY / 1.5, onComplete: (() => {
                                animationAmount += 1;
                                // 代表三個都做完動畫了
                                if (animationAmount >= 3) {
                                    console.log('本局全部完成');
                                    this.machineIsRun = false;
                                }
                            })
                        })
                    })
                })
            })
        }



        if (sameItems.length < 3) {
            console.log('沒中喔~,再接再厲')
            console.log('本局全部完成');
            this.machineIsRun = false;
        }
    }
}