export class DJTimerService  {
    serviceName: string;

    timer: any = {};

    private static _instance: DJTimerService

    // 获取单例
    public static getInstance() {
        if(!this._instance) {
            this._instance = new DJTimerService()
        }
        return this._instance;
    }

    clearTimer(timeName: string) {
        if (this.timer[timeName]) {
            clearTimeout(this.timer[timeName]);
            this.timer[timeName] = undefined;
        }
    }

    clearAllTimer() {
        Object.keys(this.timer).forEach(k => {
            if (this.timer[k]) {
                clearTimeout(this.timer[k]);
                this.timer[k] = undefined;
            }
        });
    }

    /**
     * 定时单次任务
     * @param timerName
     * @param time
     * @param cb
     */
    runTimer(timerName: string, time: number, cb: Function) {
        this.timer[timerName] = setTimeout(() => {
            if (cb) cb();
        }, time);
    }

    /**
     * 重复任务
     * @param timerName
     * @param time
     * @param cb
     */
    runForeverTimer(timerName: string, time: number, cb: Function) {
        this.timer[timerName] = setInterval(() => {
            if (cb) cb();
        }, time);
    }
    /**
     * 重复任务
     * @param timerName
     * @param time
     * @param count 次数
     * @param cb
     */
    runCountTimer(timerName: string, time: number, count: number = 1, cb: Function, complete?: Function) {
        this.timer[timerName] = setInterval(() => {
            --count;
            if (cb) cb(count);
            if (count <= 0) {
                if (complete) complete();
                this.clearTimer(timerName);
            }
        }, time);
    }

    runSocketHeartBeat(time: number = 2000, cb: Function) {
        this.clearSocketHeartBeat();
        this.runForeverTimer('socket_heart_beat', time, cb);
    }

    /**
     * 重连定时器
     * @param time
     * @param maxCount
     * @param cb
     */
    runSocketReConnect(time: number = 2000, maxCount: number, cb: Function, complete?: Function) {
        this.clearSocketReConnect();
        this.runCountTimer('socket_reconnect', time, maxCount, cb, complete);
    }

    /**
     * 当socket 断开连接后 定时
     */
    runSocketCloseTimeOut() {
        this.clearSocketCloseTimeOut();
    }

    /**
     * 设置加载资源超时
     */
    runLoadTimeOut(errcb?: Function) {
        this.clearLoadTimer();
        this.runTimer('load_time_out', 20 * 1000, () => {
        });
    }

    /**
     * 获取服务器配置
     */
    runGetConfig() {
        this.clearTimer('get_config');
        this.runForeverTimer('get_config', 6 * 1000, () => {
        });
    }

    /**
     * 停止心跳
     */
    clearSocketHeartBeat() {
        this.clearTimer('socket_heart_beat');
    }
    clearSocketCloseTimeOut() {
        this.clearTimer('socket_time_out');
    }

    clearLoadTimer() {
        this.clearTimer('load_time_out');
    }
    clearSocketReConnect() {
        this.clearTimer('socket_reconnect');
    }
    clearRefreshHallData() {
        this.clearTimer('refresh_hall_data');
    }
}

export const times = DJTimerService.getInstance()