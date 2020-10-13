import Phaser from 'phaser'
import { game } from '../main'


interface ContainerModle {
    container: Phaser.GameObjects.Container;
    speed: number;
    isDone: boolean;
}

export default class MainScene extends Phaser.Scene {


    containerList: ContainerModle[] = [];
    apple1: Phaser.GameObjects.Image; // 蘋果
    rectWidth = 150; // 正方形直徑
    rectHeight = 255;
    imageDiameter = this.rectWidth * 0.9;

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
        buttonFour.on('pointerdown', () => { this.startRun() });

    }

    creatContainer(index: number) {
        //設置container
        var newContainer = this.add.container(214 + 212 * index, 295);
        newContainer.width = this.rectWidth;
        newContainer.height = this.rectHeight;

        // 設置圖片加入container
        this.addItem(newContainer, this.rectWidth / 2, this.rectHeight / 2);

        // container 加入遮罩(就是畫一個跟container一樣長寬的矩形遮住它)
        var graphics = this.add.graphics(); // graphics 是繪製基本圖型的方法
        var color = 0xffffff;
        var thickness = 2;
        var alpha = 1;
        graphics.lineStyle(thickness, color, alpha); // 線條的樣式
        // graphics.strokeRect(0, 0, this.rectWidth, this.rectHeight); // 筆畫方行
        graphics.fillStyle(color, 0); // 全透明 ,這樣遮上去,透明部分才會露出來,看得到底下的東西
        graphics.fillRect(0, 0, this.rectWidth, this.rectHeight); // 方形
        graphics.x = newContainer.x;
        graphics.y = newContainer.y;
        newContainer.mask = new Phaser.Display.Masks.GeometryMask(this, graphics);

        var obj = {
            container: newContainer,
            speed: 0,
            isDone: false
        }

        this.containerList.push(obj);
    }



    addItem(container: Phaser.GameObjects.Container, x: number, y: number) {
        const keyList = ['bar', 'bell', 'cherry', 'diamond', 'grape', 'orange', 'seven', 'star', 'watermelon'];
        const randomIndex = Math.floor(Math.random() * 9); // 隨機產生0~8
        var item = this.add.image(x, y, keyList[randomIndex]);
        item.displayHeight = this.imageDiameter; // 設置寬 為容器寬的一半
        item.scaleX = item.scaleY // 等比縮放
        container.add(item);// 蘋果加入容器
    }



    // 所有container漸漸加速
    startRun() {
        //container 的index
        var index = 0;
        //每700毫秒換下一個啟動
        var startInterval = setInterval(() => {
            this.addSpeed(index);
            // 換下一個container 啟動
            index += 1;
            if (index >= this.containerList.length) {
                clearInterval(startInterval);
            }
        }, 630)
    }

    //漸漸加速
    addSpeed(index: number) {
        this.containerList[index].isDone = false;
        var interval = setInterval(() => {
            if (this.containerList[index].speed < 15) {
                this.containerList[index].speed += 2
            } else {
                clearInterval(interval);
                // 已經到最快速度了

                // 三秒後沒停止,自己停
                setTimeout(() => {
                    if (this.containerList[index].isDone == false) {
                        this.reduceSpeed(this.containerList[index]);
                    }
                }, 3000)
            }
        }, 200);
    }


    // 漸漸減速
    reduceSpeed(obj: ContainerModle) {
        var interval = setInterval(() => {
            if (obj.speed > 2) {
                obj.speed -= 2
            } else {
                obj.isDone = true
                clearInterval(interval);
            }
        }, 200);
    }

    update() {
        this.containerList.map((obj: ContainerModle) => {
            // 只要在容器內所有的item 都要移動
            obj.container.list.map((item: Phaser.GameObjects.Image) => {
                const itemHalfHeight = item.height / 2;

                // 已經被按下停止鈕
                if (obj.isDone) {
                    // @ts-ignore
                    if (item.isover !== true) {//如果沒有被標記代表是在一半以上
                        // 這樣停止時.container內只會有一個東西
                        if (item.y < obj.container.height / 2) {
                            item.y += 2;
                        }
                    }
                    // @ts-ignore
                    if (item.isover == true) { // 被標記在一半以下
                        item.y += 2;
                        // 物品完全跑出畫面時,銷毀
                        if (item.y > obj.container.height + itemHalfHeight) {
                            item.destroy()
                        }
                    }
                    return;
                }
                // 一般情況
                // 物體向下移動
                item.y += obj.speed;

                // 物品跑到一半時,加入新的物件
                if (item.y + item.height > obj.container.height) {
                    if (obj.container.list.length < 2) {
                        // @ts-ignore
                        item.isover = true; //加入新物件時,舊的給個標記
                        this.addItem(obj.container, this.rectWidth / 2, -this.rectHeight / 2);
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
