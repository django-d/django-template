export default class BMapLib {

    private static _instance: BMapLib

    // 获取单例
    public static getInstance() {
        if(!this._instance) {
            this._instance = new BMapLib()
        }
        return this._instance;
    }

    /**
     * 地球半径
     */
    public  EARTHRADIUS = 6370996.81;

    /**
     * 将度转化为弧度
     * @param {degree} Number 度
     * @returns {Number} 弧度
     */
    public  degreeToRad(degree) {
        return (Math.PI * degree) / 180;
    }

    /**
     * 将弧度转化为度
     * @param {radian} Number 弧度
     * @returns {Number} 度
     */
    public  radToDegree(rad) {
        return (180 * rad) / Math.PI;
    }

    /**
     * 将v值限定在a,b之间，纬度使用
     */
    public  _getRange(v, a, b) {
        if (a != null) {
            v = Math.max(v, a);
        }
        if (b != null) {
            v = Math.min(v, b);
        }
        return v;
    }

    /**
     * 将v值限定在a,b之间，经度使用
     */
    public  _getLoop(v, a, b) {
        while (v > b) {
            v -= b - a;
        }
        while (v < a) {
            v += b - a;
        }
        return v;
    }

    /**
     * 计算两点之间的距离,两点坐标必须为经纬度
     * @param {point1} Point 点对象
     * @param {point2} Point 点对象
     * @returns {Number} 两点之间距离，单位为米
     */
    public  getDistance(point1, point2) {
        //判断类型
        // if (!(point1 instanceof BMap.Point) ||
        //     !(point2 instanceof BMap.Point)) {
        //     return 0;
        // }

        point1.lng = this._getLoop(point1.lng, -180, 180);
        point1.lat = this._getRange(point1.lat, -74, 74);
        point2.lng = this._getLoop(point2.lng, -180, 180);
        point2.lat = this._getRange(point2.lat, -74, 74);

        var x1, x2, y1, y2;
        x1 = this.degreeToRad(point1.lng);
        y1 = this.degreeToRad(point1.lat);
        x2 = this.degreeToRad(point2.lng);
        y2 = this.degreeToRad(point2.lat);

        return (
            this.EARTHRADIUS * Math.acos(Math.sin(y1) * Math.sin(y2) + Math.cos(y1) * Math.cos(y2) * Math.cos(x2 - x1))
        );
    }
}
