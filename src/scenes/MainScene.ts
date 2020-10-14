import Phaser from 'phaser'
import { game } from '../main'


interface ContainerModle {
    container: Phaser.GameObjects.Container;
    speed: number;
    isDone: boolean; // 被按下停止按鈕
}

// isExpired: boolean; // 是否已經過期(水果移動超過空間的一半會被標記為過期)

export default class MainScene extends Phaser.Scene {


    containerList: ContainerModle[] = [];
    apple1: Phaser.GameObjects.Image;
    rectWidth = 150; // 方形寬  
    rectHeight = 255; // 方形長
    imageDiameter = this.rectWidth * 0.9; // 圖片寬

    constructor() {
        super('MainScene')
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

        this.add.image(gameWidth / 2, gameHeight / 2, 'slot-machine');

        for (let i = 0; i < 3; i++) {
            this.creatContainer(i);
        }


        // 加入按鈕1- 停止
        const buttonOne = this.add.text(270, 580, '停止', { fill: '#0f0' });
        buttonOne.setInteractive();
        buttonOne.on('pointerdown', () => { this.reduceSpeed(this.containerList[0]) });


        // 加入按鈕2 - 停止
        const buttonTwo = this.add.text(470, 580, '停止', { fill: '#0f0' });
        buttonTwo.setInteractive();
        buttonTwo.on('pointerdown', () => { this.reduceSpeed(this.containerList[1]) });

        // 加入按鈕- 停止
        const buttonThree = this.add.text(670, 580, '停止', { fill: '#0f0' });
        buttonThree.setInteractive();
        buttonThree.on('pointerdown', () => { this.reduceSpeed(this.containerList[2]) });


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
            this.allStopInorder()
        });



    }
    /** 新增一個矩型容器+遮罩 */
    creatContainer(index: number) {
        //設置container
        var newContainer = this.add.container(214 + 212 * index, 295);
        newContainer.width = this.rectWidth;
        newContainer.height = this.rectHeight;

        // 設置圖片加入container
        this.addItemToContainer(newContainer, this.rectWidth / 2, this.rectHeight / 2);

        // container 加入遮罩(就是畫一個跟container一樣長寬的矩形遮住它)
        var graphics = this.add.graphics(); // graphics 是繪製基本圖型的方法
        var color = 0xffffff;
        var thickness = 2;
        var alpha = 1;
        graphics.lineStyle(thickness, color, alpha); // 線條的樣式
        // graphics.strokeRect(0, 0, this.rectWidth, this.rectHeight); // 筆畫方行
        graphics.fillStyle(color, 0); // 全透明 ,這樣遮上去,透明部分才會露出來,看得到底下的東西
        graphics.fillRect(0, 0, this.rectWidth, this.rectHeight); // 方形
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



    addItemToContainer(container: Phaser.GameObjects.Container, x: number, y: number) {
        const keyList = ['bar', 'bell', 'cherry', 'diamond', 'grape', 'orange', 'seven', 'star', 'watermelon'];
        const randomIndex = Math.floor(Math.random() * 9); // 隨機產生0~8
        var item = this.add.image(x, y, keyList[randomIndex]);
        item.displayHeight = this.imageDiameter; // 設置寬 為容器寬的一半
        item.scaleX = item.scaleY // 等比縮放
        container.add(item);// 加入容器
    }


    /** 所有container漸漸加速 */
    allStartRun() {
        for (let i = 0; i < 3; i++) {
            this.addSpeed(i);
        };
    }

    /** 單一container漸漸加速 */
    addSpeed(index: number) {
        this.containerList[index].isDone = false;
        this.containerList[index].speed = 15;
    }

    /** 全部依序停止 */
    allStopInorder() {
        let index = 0;
        let interval = setInterval(() => {
            if (index < 3) {
                this.reduceSpeed(this.containerList[index]);
                index += 1;
            } else {
                clearInterval(interval);
            }
        }, 500);
    }


    // 單一container漸漸減速
    reduceSpeed(obj: ContainerModle) {
        obj.isDone = true
        // var interval = setInterval(() => {
        //     if (obj.speed > 2) {
        //         obj.speed -= 1
        //     } else {
        //         clearInterval(interval);
        //     }
        // }, 50); //這要短,才不會讓interval 清除得太慢
    }

    update() {
        this.containerList.map((obj: ContainerModle) => {
            // 只要在容器內所有的item 都要移動
            obj.container.list.map((item: Phaser.GameObjects.Image) => {
                const itemHalfHeight = item.height / 2;

                // 已經被按下停止鈕
                if (obj.isDone) {
                    // 不管在什麼位置,都要生成下一個新的並且停在中間
                    // 如果只有一個代表他剛生成

                    const centerYPostion = obj.container.height / 2;

                    if (item.y < centerYPostion) {
                        if (centerYPostion - item.y > 8) {
                            item.y += 8;
                        } else {
                            item.y += centerYPostion - item.y - 0.5

                        }
                    }
                    // 過期物件處理
                    // @ts-ignore
                    if (item.isExpired == true) {
                        item.y += 8;
                        // 物品完全跑出畫面時,銷毀
                        if (item.y > obj.container.height + itemHalfHeight) {
                            item.destroy()
                        }
                    }
                    return;
                }

                // 一般情況
                // 物體持續向下移動
                item.y += obj.speed;

                // 物品超過容器中央,標記為過期
                if (item.y > obj.container.height / 2) {
                    // @ts-ignore
                    item.isExpired = true;
                    // 並加入新物件
                    if (obj.container.list.length < 2) {
                        this.addItemToContainer(obj.container, this.rectWidth / 2, -this.rectHeight / 2);
                    }
                }
                // 物品完全跑出畫面時,銷毀
                if (item.y > obj.container.height + itemHalfHeight) {
                    item.destroy()
                }
            })

        })

    }
}


