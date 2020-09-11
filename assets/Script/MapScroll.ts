import { DComponent } from '../DjangoLib/Base/DComponent';
import { dclass, DNode } from '../DjangoLib/Descript/dclass';

export enum DIRECTION {
    LEFT = 1,
    RIGHT = 2,
    UP = 3,
    DOWN = 4,
}
/**
 * 多块地图滚动组件
 */
const { ccclass, property } = cc._decorator;
@dclass()
export default class ScrollThroughMultipleMaps extends DComponent {
    @property([cc.Node])
    NodeList: cc.Node[] = [];
    @property(cc.Integer)
    speed: number = 50;
    @property({ tooltip: '1: 表示 LEFT; 2: 表示 RIGHT; 3 表示 UP; 4 表示: DOWN' })
    direction: DIRECTION = DIRECTION.DOWN;

    _endNode: DNode;
    headPos: cc.Vec2;
    footPos: cc.Vec2;
    headLimit: number = 0;
    footLimit: number = 0;
    isRun: boolean = false;
    isStop: boolean = false;
    count: number = 0;
    start() {
        this.isRun = true;
        this.setHeadFoot();

        setInterval(() => {
            const n = new cc.Node();
            const l = n.addComponent(cc.Label);
            l.string = `这是第${this.count}`;
            n.parent = this.node;
        }, 1000);
    }

    setHeadFoot() {
        this.headPos = this.NodeList[0].getPosition();
        this.footPos = this.NodeList[this.NodeList.length - 1].getPosition();
        switch (this.direction) {
            case DIRECTION.LEFT: {
                this.headLimit = this.headPos.x - this.NodeList[0].getContentSize().width;
                this.footLimit = this.footPos.x;
                break;
            }
            case DIRECTION.RIGHT: {
                this.headLimit = this.headPos.x + this.NodeList[0].getContentSize().width;
                this.footLimit = this.footPos.x;
                break;
            }
            case DIRECTION.DOWN: {
                this.headLimit = this.headPos.y - this.NodeList[0].getContentSize().height;
                this.footLimit = this.footPos.y;
                break;
            }
            case DIRECTION.UP: {
                this.headLimit = this.headPos.y + this.NodeList[0].getContentSize().height;
                this.footLimit = this.footPos.y;
            }
        }
    }

    checkMoveLeftAllPos() {
        if (this.NodeList[0].x < this.headLimit) {
            var offset =
                this.footLimit -
                this.NodeList[this.NodeList.length - 1].x -
                this.NodeList[this.NodeList.length - 1].width;
            this.NodeList[0].x = this.footLimit - offset;
            this.NodeList.push(this.NodeList.splice(0, 1)[0]);
        }
    }
    checkMoveRightAllPos() {
        if (this.NodeList[0].x > this.headLimit) {
            var offset =
                this.NodeList[this.NodeList.length - 1].x -
                this.footLimit -
                this.NodeList[this.NodeList.length - 1].width;
            this.NodeList[0].x = this.footLimit + offset;
            this.NodeList.push(this.NodeList.splice(0, 1)[0]);
        }
    }
    checkMoveDownAllPos() {
        if (this.NodeList[0].y < this.headLimit) {
            var offset =
                this.footLimit -
                this.NodeList[this.NodeList.length - 1].y -
                this.NodeList[this.NodeList.length - 1].height;
            this.NodeList[0].y = this.footLimit - offset;
            this.NodeList.push(this.NodeList.splice(0, 1)[0]);
        }
    }
    checkMoveUPAllPos() {
        if (this.NodeList[0].y > this.headLimit) {
            // if (this.count === 3) {
            //     this.isStop = true;
            // }
            // this.count++;

            // if (this.isStop) {
            //     this.NodeList.splice(0, 1, this._endNode);
            //     // this.setHeadFoot();
            //     this.isStop = false;
            // }
            var offset =
                this.NodeList[this.NodeList.length - 1].y -
                this.footLimit -
                this.NodeList[this.NodeList.length - 1].height;

            this.NodeList[0].y = this.footLimit + offset;
            this.NodeList.push(this.NodeList.splice(0, 1)[0]);
        }
    }
    update(dt) {
        if (!this.isRun) return;
        switch (this.direction) {
            case DIRECTION.LEFT: {
                for (let i = this.NodeList.length - 1; i >= 0; i--) {
                    this.NodeList[i].x -= dt * this.speed;
                }
                this.checkMoveLeftAllPos();
                break;
            }
            case DIRECTION.RIGHT: {
                for (let i = this.NodeList.length - 1; i >= 0; i--) {
                    this.NodeList[i].x += dt * this.speed;
                }
                this.checkMoveRightAllPos();
                break;
            }
            case DIRECTION.DOWN: {
                for (let i = this.NodeList.length - 1; i >= 0; i--) {
                    this.NodeList[i].y -= dt * this.speed;
                }
                this.checkMoveDownAllPos();
                break;
            }
            case DIRECTION.UP: {
                for (let i = this.NodeList.length - 1; i >= 0; i--) {
                    this.NodeList[i].y += dt * this.speed;
                }
                this.checkMoveUPAllPos();
                break;
            }
        }
    }
}
