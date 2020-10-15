import Phaser from 'phaser'
import { game } from '../main'
import { AlignGrid } from '../alignGrid'

interface ContainerModle {
    container: Phaser.GameObjects.Container;
    speed: number;
    isDone: boolean; // 此容器被按下停止按鈕
}

// isExpired: boolean; // 是否已經過期(水果移動超過空間的一半會被標記為過期)

export default class RatioScene extends Phaser.Scene {


    containerList: ContainerModle[] = [];
    rectWidth = 150; // 方形寬  
    rectHeight = 255; // 方形長
    imageDiameter = this.rectWidth * 0.9; // 圖片寬
    round = 0;// 回合
    timer: any; // 自動依序停止的timer
    finishContainer = 0; // 已經結束動作的container
    slotMachine: Phaser.GameObjects.Image
    constructor() {
        super('HomeScene')
    }

    preload() {
        this.load.image('slot-machine', 'assets/slot-machine.png');
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
        var gameWidth = +game.config.width;
        var gameHeight = +game.config.height;

        const gridConfig = {
            'scene': this,
            'cols': 1,
            'rows': 2,
            'gameHeight': gameHeight,
            'gameWidth': gameWidth
        }


        this.slotMachine = this.add.image(gameWidth / 2, gameHeight / 2, 'slot-machine');

        var alignGrid = new AlignGrid(gridConfig);
        alignGrid.showGridNumber();
        alignGrid.placeAtIndex(1, this.slotMachine);
        alignGrid.scaleToGridHeight(this.slotMachine);

        this.drawRect(this.slotMachine.x - this.slotMachine.displayWidth / 2, this.slotMachine.y - this.slotMachine.displayHeight / 2, this.slotMachine.displayWidth, this.slotMachine.displayHeight)

        for (let i = 0; i < 3; i++) {
            this.creatContainer(i);
        }




        // 加入按鈕1- 停止
        const buttonOne = this.add.text(270, 580, '停止', { fill: '#0f0' });
        buttonOne.setInteractive();
        buttonOne.on('pointerdown', () => { this.stopContainerScroll(this.containerList[0]) });


        // 加入按鈕2 - 停止
        const buttonTwo = this.add.text(470, 580, '停止', { fill: '#0f0' });
        buttonTwo.setInteractive();
        buttonTwo.on('pointerdown', () => { this.stopContainerScroll(this.containerList[1]) });

        // 加入按鈕- 停止
        const buttonThree = this.add.text(670, 580, '停止', { fill: '#0f0' });
        buttonThree.setInteractive();
        buttonThree.on('pointerdown', () => { this.stopContainerScroll(this.containerList[2]) });


        // 加入按鈕 全部開始
        const buttonFour = this.add.text(800, 580, '開始', { fill: '#0f0' });
        buttonFour.setInteractive();
        buttonFour.on('pointerdown', () => {
            this.allStartRun()
        });

        // 加入按鈕 全部停止
        const buttonFive = this.add.text(800, 680, '全部停止', { fill: '#0f0' });
        buttonFive.setInteractive();
        buttonFive.on('pointerdown', () => {
            this.allStopImmediately()
        });

    }
    /** 新增一個矩型容器+遮罩 */
    creatContainer(index: number) {

        // 整台機器(照片)的最左上角位置(以這邊為原點做計算)
        const originX = this.slotMachine.x - this.slotMachine.displayWidth / 2;
        const originY = this.slotMachine.y - this.slotMachine.displayHeight / 2;
        const machineWidth = this.slotMachine.displayWidth;
        const machineHeight = this.slotMachine.displayHeight;

        const boxWidth = machineWidth * (1.50 / 9.1);
        const boxHeight = machineHeight * (2.5 / 5.8);
        //設置container
        var newContainer = this.add.container(originX + machineWidth * (1.7 / 9.1) + (machineWidth * (0.48 / 9.1) + boxWidth) * index, originY + (machineHeight * (2 / 5.8)));
        newContainer.width = boxWidth;
        newContainer.height = boxHeight;

        // 設置圖片加入container
        this.addItemToContainer(newContainer, this.rectWidth / 2, this.rectHeight / 2, true, false);

        // container 加入遮罩(就是畫一個跟container一樣長寬的矩形遮住它)
        var graphics = this.add.graphics(); // graphics 是繪製基本圖型的方法
        var color = 0xffffff;
        var thickness = 2;
        var alpha = 1;
        graphics.lineStyle(thickness, color, alpha); // 線條的樣式
        graphics.strokeRect(0, 0, newContainer.width, newContainer.height); // 筆畫方行
        graphics.fillStyle(color, 0); // 全透明 ,這樣遮上去,透明部分才會露出來,看得到底下的東西
        graphics.fillRect(0, 0, newContainer.width, newContainer.height); // 方形
        graphics.x = newContainer.x; // 遮罩的x座標對齊容器x座標
        graphics.y = newContainer.y; // 遮罩的y座標對齊容器x座標
        newContainer.mask = new Phaser.Display.Masks.GeometryMask(this, graphics); // 容器加入遮罩

        var obj = {
            container: newContainer,
            speed: 0,
            isDone: false
        }
        this.containerList.push(obj);
    }


    /** 將item加入容器 */
    addItemToContainer(container: Phaser.GameObjects.Container, x: number, y: number, haveToStop: boolean, autoMove: boolean) {
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
        item.displayHeight = this.imageDiameter; // 設置寬 為容器寬的一半
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
            this.physics.moveTo(item, container.width / 2, 200, 800);
        }
    }



    /** 所有container內物件開始移動 */
    allStartRun() {
        this.finishContainer = 0;// 歸零

        this.containerList.map((obj: ContainerModle) => {
            obj.isDone = false
            obj.container.list.map((item: Phaser.Physics.Arcade.Sprite) => {
                this.physics.moveTo(item, obj.container.width / 2, 200, 800);
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
                this.stopContainerScroll(this.containerList[index]);
                index += 1;
            } else {
                clearInterval(interval);
            }
        }, 300);
    }


    /** 全部container 馬上停止 */
    allStopImmediately() {
        clearTimeout(this.timer);

        this.containerList.map((obj: ContainerModle) => {
            this.stopContainerScroll(obj)
        })
    }

    // 單一container內物件停止
    stopContainerScroll(obj: ContainerModle) {
        obj.isDone = true
    }

    /** 結算成績 */
    calculateResult() {
        var tempItem = [];
        this.containerList.map((obj: ContainerModle) => {
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

    update() {
        this.containerList.map((obj: ContainerModle) => {
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
                            this.finishContainer += 1;
                            if (this.finishContainer === 3) {
                                // 要結算成績
                                this.calculateResult();
                            }

                        }
                    }
                }

                // // 物品超過容器中央,標記為過期
                // if (item.y > obj.container.height / 2) {
                //     // 並加入新物件
                //     if (obj.container.list.length < 2) {
                //         // 已經被按下停止鈕
                //         if (obj.isDone) {
                //             this.addItemToContainer(obj.container, this.rectWidth / 2, -this.rectHeight / 2, true, true);
                //         } else {
                //             this.addItemToContainer(obj.container, this.rectWidth / 2, -this.rectHeight / 2, false, true);
                //         }
                //     }
                // }
                // 物品完全跑出畫面時,銷毀
                if (item.y > obj.container.height + itemHalfHeight) {
                    item.destroy()
                }
            })

        })

    }


    /** 畫一格框框 */
    drawRect(x: number, y: number, width: number, height: number) {
        var graphics = this.add.graphics(); // graphics 是繪製基本圖型的方法
        var color = 0xff32c98d;
        var thickness = 2;
        var alpha = 1;
        graphics.lineStyle(thickness, color, alpha); // 線條的樣式
        graphics.strokeRect(x, y, width, height);
    }
}