import Phaser from 'phaser'
import game from '../main'

export default class MainScene extends Phaser.Scene {


    containerList: Phaser.GameObjects.Container[] = [];
    apple1: Phaser.GameObjects.Image; // 蘋果
    diameter = 150; // 正方形直徑
    imageDiameter = this.diameter * 0.7;

    speed = 0;// 滾動速度
    isDone = false;
    constructor() {
        super('MainScene')
    }

    preload() {
        this.load.image('apple', 'assets/apple.png');
        this.load.image('orange', 'assets/orange.png');
        this.load.image('strawberry', 'assets/strawberry.png');
    }
    create() {

        for (let i = 0; i < 3; i++) {
            this.creatContainer(i);
        }

        this.addSpeed();


        // 加入按鈕1
        const buttonOne = this.add.text(100, 300, '停止', { fill: '#0f0' });
        buttonOne.setInteractive();
        buttonOne.on('pointerdown', () => { this.reduceSpeed() });


        // 加入按鈕２
        const buttonTwo = this.add.text(300, 300, '繼續', { fill: '#0f0' });
        buttonTwo.setInteractive();
        buttonTwo.on('pointerdown', () => { this.isDone = false, this.addSpeed() });

    }

    creatContainer(index: number) {
        //設置container
        var newContainer = this.add.container(150 * index, 100);
        newContainer.width = this.diameter;
        newContainer.height = this.diameter;

        // 設置圖片加入container
        this.addItem(newContainer, this.diameter / 2, this.diameter / 2);

        // container 加入遮罩(就是畫一個跟container一樣長寬的矩形遮住它)
        var graphics = this.add.graphics(); // graphics 是繪製基本圖型的方法
        var color = 0xffffff;
        var thickness = 2;
        var alpha = 1;
        graphics.lineStyle(thickness, color, alpha); // 線條的樣式
        graphics.strokeRect(0, 0, this.diameter, this.diameter); // 筆畫方行
        graphics.fillStyle(color, 0); // 全透明 ,這樣遮上去,透明部分才會露出來,看得到底下的東西
        graphics.fillRect(0, 0, this.diameter, this.diameter); // 方形
        graphics.x = newContainer.x;
        graphics.y = newContainer.y;
        newContainer.mask = new Phaser.Display.Masks.GeometryMask(this, graphics);

        this.containerList.push(newContainer);
    }

    addItem(container: Phaser.GameObjects.Container, x: number, y: number) {
        const keyList = ['apple', 'orange', 'strawberry'];
        const randomIndex = Math.floor(Math.random() * 3); // 隨機產生0~2
        var item = this.add.image(x, y, keyList[0]);
        item.displayHeight = this.imageDiameter; // 設置寬 為容器寬的一半
        item.scaleX = item.scaleY // 等比縮放
        container.add(item);// 蘋果加入容器
    }



    // 漸漸加速
    addSpeed() {

        var interval = setInterval(() => {
            if (this.speed < 10) {
                this.speed += 2
            } else {
                clearInterval(interval);
            }
        }, 200);
    }

    reduceSpeed() {
        var interval = setInterval(() => {
            if (this.speed > 1) {
                this.speed -= 1
            } else {

                this.isDone = true
                clearInterval(interval);
            }
        }, 200);
    }

    update() {


        // 只要在容器內所有的item 都要移動
        this.containerList[0].list.map((item: Phaser.GameObjects.Image) => {
            const itemHalfHeight = item.height / 2;


            if (this.isDone) {
                // @ts-ignore
                if (item.isover !== true) {
                    // 這樣停止時.container內只會有一個東西
                    if (item.y < this.containerList[0].height / 2) {
                        item.y += 1;
                    }
                }
                // @ts-ignore
                if (item.isover == true) {
                    item.y += 1;
                    // 物品完全跑出畫面時,銷毀
                    if (item.y > this.containerList[0].height + itemHalfHeight) {
                        item.destroy()
                    }
                }
                return;
            }

            item.y += this.speed;
            // item.body.position.y += 5;

            // 物品跑到一半時,加入新的物件
            if (item.y + itemHalfHeight > this.containerList[0].height) {

                if (this.containerList[0].list.length < 2) {
                    // @ts-ignore
                    item.isover = true; //加入新物件時,舊的給個標記
                    this.addItem(this.containerList[0], this.diameter / 2, -this.diameter / 2);

                }
            }
            // 物品完全跑出畫面時,銷毀
            if (item.y > this.containerList[0].height + itemHalfHeight) {
                item.destroy()
            }
        })

        this.containerList[1].list.map((item: Phaser.GameObjects.Sprite) => {
            item.y += 5;
            // item.body.position.y += 5;
            const itemHalfHeight = item.height / 2;
            // 物品跑到一半時,加入新的物件
            if (item.y + itemHalfHeight > this.containerList[0].height) {

                if (this.containerList[1].list.length < 2) {
                    this.addItem(this.containerList[1], this.diameter / 2, -this.diameter / 2);
                }
            }
            // 物品完全跑出畫面時,銷毀
            if (item.y > this.containerList[1].height + itemHalfHeight) {
                item.destroy()
            }
        })

        this.containerList[2].list.map((item: Phaser.GameObjects.Sprite) => {
            item.y += 5;
            // item.body.position.y += 5;
            const itemHalfHeight = item.height / 2;
            // 物品跑到一半時,加入新的物件
            if (item.y + itemHalfHeight > this.containerList[0].height) {

                if (this.containerList[2].list.length < 2) {
                    this.addItem(this.containerList[2], this.diameter / 2, -this.diameter / 2);
                }
            }
            // 物品完全跑出畫面時,銷毀
            if (item.y > this.containerList[2].height + itemHalfHeight) {
                item.destroy()
            }
        })
    }
}
