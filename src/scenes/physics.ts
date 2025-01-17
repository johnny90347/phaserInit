import Phaser from 'phaser'
import { game } from '../main'
import { AlignGrid } from '../alignGrid'
import { createJSDocThisTag } from 'typescript';

interface ContainerModle {
    container: Phaser.GameObjects.Container;
    isDone: boolean; // 此容器被按下停止按鈕
}


export default class PhysicsScene extends Phaser.Scene {

    gameScreenWidth = 0;
    gameScreenHeight = 0;

    slotBoxList: Phaser.GameObjects.Container[] = [];
    slotBoxWidth = 0; // 角子機box寬
    slotBoxHeight = 0; // 角子機box的長
    slotMachine: Phaser.GameObjects.Sprite // 角子機的圖案
    itemWidth = 0;//水果物件的寬

    timer: any; // 自動依序停止的timer
    finishSlotBox = 0; // 已經結束動作的container
    alignGrid: AlignGrid; // 網格的class
    slotDropSpeed = 0;
    machineIsRun = false; // 機器現在有沒有在跑
    round = 0;// 機器已經跑了幾回合
    maxCanRunRound = 100;//最多可以讓他跑幾回合;(可以抽幾次獎項)

    // 檢查點族群
    markCheckPointGroup: Phaser.GameObjects.Group;
    addItemCheckPointGroup: Phaser.GameObjects.Group;
    deleteCheckPointGroup: Phaser.GameObjects.Group;
    //最大重力
    gravityValue = 800;


    machineTapStop = false;//已經被按下停止了嗎?

    // 結果
    resultList: Phaser.Physics.Arcade.Sprite[] = [];

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
        this.alignGrid.showGridNumber();

        // 建立物件

        //生成group 碰撞用
        this.markCheckPointGroup = this.add.group();
        this.addItemCheckPointGroup = this.add.group();
        this.deleteCheckPointGroup = this.add.group();

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




        // const orange = this.physics.add.sprite(0, 0, 'orange');
        // this.alignGrid.placeAtIndex(16, orange);
        // orange.setImmovable();
        // this.bell = this.physics.add.image(0, 0, 'bell');
        // this.alignGrid.placeAtIndex(6, this.bell);
        // this.bell.setVelocity(0, 200);
        // this.bell.setCollideWorldBounds(true);
        // this.bell.setGravityY(this.gravity);
        // this.bell.setMaxVelocity(0, 200);
        // this.bell.setAccelerationY(200);// 加速度
        // this.bell.setBounce(1, 1);
        // var bell2 = this.physics.add.image(0, 0, 'bell');
        // this.alignGrid.placeAtIndex(1, bell2);
        // bell2.setGravityY(this.gravity);
        // bell2.setCollideWorldBounds(true);
        // bell2.setBounce(1, 1);
        // bell2.setVelocityY(200)
        // var group = this.add.group();
        // group.add(orange);
        // this.array.push(this.bell);
        // var phy = this.physics.add.group()
        // phy.add(this.bell);
        // // phy.add(bell2);
        // phy.setVelocityY(200)
        // this.physics.add.collider(this.bell, group, ((bell: Phaser.Physics.Arcade.Sprite) => {
        //     console.log('123')
        //     bell.setVelocity(0, 10);
        //     bell.setGravityY(0)
        //     this.add.tween({ targets: bell, duration: 1000, y: 300, x: 250 });
        //     this.add.tween({ targets: group.children.entries[0], duration: 100, y: 300, x: 250 });
        //     group.children.entries[0].body.velocity.y = -200
        // }));

        // setTimeout(() => {
        //     group.clear()
        //     console.log(group)

        //     this.array.map((item: Phaser.Physics.Arcade.Image) => {
        //         item.setVelocityY(200)
        //     })
        // }, 5000)

        // setTimeout(() => {
        //     group.add(orange);

        // }, 10000)

        // const star = this.physics.add.sprite(0, 0, 'star');
        // this.alignGrid.placeAtIndex(8, star);
        // orange.setImmovable();
        // this.debugInfoText = this.add.text(0, 0, `${this.bell.body.velocity.y}`, { fill: '#5093ad', fontSize: 16.0 });
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
        this.itemWidth = boxWidth * 0.8; // 設置圖片需要的高度

        //加入檢查點,不可動
        const markCheckPoint = this.physics.add.image(boxWidth / 2, boxHeight, 'check-point');
        const addItemCheckPoint = this.physics.add.image(boxWidth / 2, boxHeight + boxHeight * 0.1, 'check-point');
        const deleteCheckPoint = this.physics.add.image(boxWidth / 2, boxHeight + boxHeight, 'check-point');
        markCheckPoint.displayWidth = boxWidth;
        addItemCheckPoint.displayWidth = boxWidth;
        deleteCheckPoint.displayWidth = boxWidth;
        markCheckPoint.setImmovable();
        addItemCheckPoint.setImmovable();
        deleteCheckPoint.setImmovable();
        this.markCheckPointGroup.add(markCheckPoint);
        this.addItemCheckPointGroup.add(addItemCheckPoint);
        this.deleteCheckPointGroup.add(deleteCheckPoint);
        newSlotBox.add(markCheckPoint);
        newSlotBox.add(addItemCheckPoint);
        newSlotBox.add(deleteCheckPoint);

        this.slotBoxList.push(newSlotBox);
        this.addItemToBox(newSlotBox, boxWidth / 2, boxHeight / 2, true);

        // 產生矩行遮罩的位置及大小
        const graphics = this.drawFillRect(newSlotBox.x, newSlotBox.y, newSlotBox.width, newSlotBox.height, 0xffffff, 0);
        this.drawRectLine(newSlotBox.x, newSlotBox.y, newSlotBox.width, newSlotBox.height, 0xffffff, 1);
        // 將box加入遮罩
        newSlotBox.mask = new Phaser.Display.Masks.GeometryMask(this, graphics); // 容器加入遮罩

    }

    /** 將item加入容器 */
    addItemToBox(container: Phaser.GameObjects.Container, x: number, y: number, isFirstCreated: boolean) {
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
        item.displayWidth = this.itemWidth; // 設置寬 為容器寬的一半
        item.scaleY = item.scaleX // 等比縮放
        // 第一次建立沒速度
        if (isFirstCreated === true) {
            item.setVelocityY(0)
            this.resultList.push(item);
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

        container.add(item);// 加入容器

        //增加碰撞條件, 每個碰到刪除點 都要消失
        this.physics.add.collider(item, this.deleteCheckPointGroup, ((item) => { item.destroy() }));
        // 增加碰撞條件, 每個碰到新增點 都要新增一個item

        // 如果是下停止鈕,那要增加第一個檢查點的碰撞   
        if (this.machineTapStop === true) {
            const collider = this.physics.add.collider(item, this.markCheckPointGroup, ((item: Phaser.Physics.Arcade.Sprite) => {
                //碰到後做動畫
                this.add.tween({ targets: item, duration: 200, x: container.width / 2, y: container.height / 2 });
                this.resultList.push(item);
                item.setVelocityY(0);
                // 有三個代表都跑完了,結算
                if (this.resultList.length === 3) {
                    console.log('結算瞜')
                }
                collider.destroy();
            }));
        }

        const overlap = this.physics.add.overlap(item, this.addItemCheckPointGroup, ((item: Phaser.Physics.Arcade.Sprite) => {
            overlap.destroy();
            this.addItemToBox(container, this.slotBoxWidth / 2, -item.displayWidth / 2, false);
        }));
    }

    /** 所有container內物件開始移動 */
    allBoxStartRun() {
        this.slotMachine.play('action');
        this.machineTapStop = false;
        this.resultList.map((item: Phaser.Physics.Arcade.Sprite) => {
            item.setVelocityY(this.gravityValue);
        })

        this.resultList = [];
    }

    /** 全部container 馬上停止 */
    allStopImmediately() {
        this.machineTapStop = true;
    }
    /** 全部container依序停止 */
    allStopInorder() {
        // let index = 0;
        // let interval = setInterval(() => {
        //     if (index < 3) {
        //         this.stopSingleBoxScroll(this.slotBoxList[index]);
        //         index += 1;
        //     } else {
        //         clearInterval(interval);
        //     }
        // }, 300);
    }


    /** 全部container 馬上停止 */
    // allStopImmediately() {
    //     clearTimeout(this.timer);
    //     this.slotBoxList.map((obj: ContainerModle) => {
    //         this.stopSingleBoxScroll(obj);
    //     })
    // }

    // 單一container內物件停止
    stopSingleBoxScroll(obj: ContainerModle) {
        obj.isDone = true
    }

    /** 結算成績 */
    calculateResult() {
        // var tempItem = [];
        // this.slotBoxList.map((obj: ContainerModle) => {
        //     obj.container.list.map((item: Phaser.Physics.Arcade.Sprite) => {
        //         if (tempItem.length == 0) {// 第一個值先存進入
        //             tempItem.push(item);
        //             return;
        //         }
        //         // id跟存進去的一樣就push進去
        //         // @ts-ignore
        //         if (tempItem.length != 0 && tempItem[0].id == item.id) {
        //             tempItem.push(item);
        //             return;
        //         }
        //     })
        // })
        // // 裡面有放滿3個就是中獎了
        // if (tempItem.length == 3) {
        //     console.log('中獎拉');
        //     console.log('項目', tempItem[0].key)
        //     console.log('倍率', tempItem[0].odds)
        // } else {
        //     console.log('沒中獎')
        // }

    }
}