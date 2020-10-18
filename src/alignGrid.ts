import { game } from './main'
import Phaser from 'phaser'

interface ConfigModel {
    scene: Phaser.Scene;
    cols: number;
    rows: number;
    gameWidth: number;
    gameHeight: number;
}

export class AlignGrid {

    scene: Phaser.Scene;
    gameHeight: number;
    gameWidth: number;
    rows: number;
    cols: number;

    columnWidth: number; // 每個網格的行寬    
    columnHeight: number; // 每個網格的行高

    constructor(config: ConfigModel) {
        if (!config.scene) {
            console.log("網格無收到場景");
            return;
        }
        if (!config.rows) {
            //預設
            config.rows = 3;
        }
        if (!config.cols) {
            //預設
            config.cols = 3;
        }

        this.gameHeight = config.gameHeight;
        this.gameWidth = config.gameWidth;
        this.rows = config.rows;
        this.cols = config.cols;
        this.scene = config.scene;

        // 計算行寬
        this.columnWidth = this.gameWidth / this.cols;
        // 計算行高
        this.columnHeight = this.gameHeight / this.rows;
    }

    /** 顯示網格加數字 */
    public showGridNumber() {
        this.showGrid()
        var n = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const numberText = this.scene.add.text(0, 0, `${n}`, { color: 'red' })
                numberText.setOrigin(0.5, 0.5);
                this.placeAt(j, i, numberText);
                n++
            };

        }
    }

    /** 將物件定位在網格的數字上 */
    public placeAtIndex(index: number, obj: any) {
        const yy = Math.floor(index / this.cols);
        const xx = index - (yy * this.cols);
        this.placeAt(xx, yy, obj);
    }

    /** 將物件縮小至螢幕寬度的幾％(輸入0-1) */
    public scaleToGameWidth(obj: any, ratio: number) {
        obj.displayWidth = this.gameWidth * ratio;
        obj.scaleY = obj.scaleX;
    }
    /** 將物件縮放跟網格寬ㄧ樣 */
    public scaleToGridWidth(obj: any) {
        obj.displayWidth = this.gameWidth / this.cols;
        obj.scaleY = obj.scaleX;
    }

    /** 將物件縮放跟網格高ㄧ樣 */
    public scaleToGridHeight(obj: any) {
        obj.displayHeight = this.gameHeight / this.rows;
        obj.scaleX = obj.scaleY
    }

    /** 將物件縮放至n個網格高 */
    public scaleToNMultipleGridHeight(obj: any, multipe: number) {
        obj.displayHeight = (this.gameHeight / this.rows) * multipe;
        obj.scaleX = obj.scaleY
    }


    /** 顯示網格(可以debug用) */
    private showGrid() {
        const lineWidth = 1;
        var graphics = this.scene.add.graphics();
        graphics.lineStyle(4, 0xff0000, lineWidth);

        for (let i = 0; i < this.gameWidth; i += this.columnWidth) {
            // 畫垂直的直線
            graphics.moveTo(i, 0);
            graphics.lineTo(i, this.gameHeight);
        }

        for (let i = 0; i < this.gameHeight; i += this.columnHeight) {
            graphics.moveTo(0, i);
            graphics.lineTo(this.gameWidth, i);
        }

        graphics.strokePath();
    }

    /** 放置在網格上(有座標系統的才可以放進來) */
    private placeAt(xx: number, yy: number, obj: any) {
        const x2 = this.columnWidth * xx + this.columnWidth / 2;
        const y2 = this.columnHeight * yy + this.columnHeight / 2;
        obj.x = x2;
        obj.y = y2;
    }


}