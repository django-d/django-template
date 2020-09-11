/**
 * @author: Django
 * @data : 2018-06-28
 * @description: 资源管理器
 */
import { SceneName, ResPath } from '../Consts/Consts';
import { pom } from './DJPopManager';
import { tool } from '../Util/Tool';
import { times } from './DJTimerService';

export class ResManager {
    managerName: string;

    loaded: any = {};

    loadedSubs: any = {};

    sceneName: string = SceneName.LOGINSCENE;

    loadingState: number = 0;

    // async loadPrefabByName(name, pathType?: string): Promise<cc.Prefab> {
    //     const res = await this.getRes(`prefab/${name}`, pathType, cc.Prefab);
    //     return res;
    // }

    /**
     * 取plist
     *
     * atlasPath : 'images/atlas/gongyong'
     */
    // async loadAtlasByName(name, pathType?: string): Promise<cc.SpriteAtlas> {
    //     return this.getRes(`plist/${name}`, pathType, cc.SpriteAtlas);
    // }

    // async loadSpriteFrame(path, pathType?: string): Promise<cc.SpriteFrame> {
    //     const texture = await this.getRes(path, pathType, cc.SpriteFrame);
    //     const frame = new cc.SpriteFrame(texture);
    //     return frame;
    // }

    public async setSpriteFrame(target: cc.Node | cc.Sprite, name: string, pathType?: string) {
        let comp: cc.Sprite;
        if (target instanceof cc.Sprite) {
        } else {
            comp = (target as cc.Node).getComponent(cc.Sprite);
        }
        comp.spriteFrame = await this.getSpriteFrame(name, pathType);
    }

    /**
     * 获取内存中
     * @param name
     * @param pathType
     */
    async getPrefabByName(name, pathType?: string): Promise<cc.Prefab> {
        const path = this.getPath(`prefab/${name}`, pathType);
        const prefab = await this.getRes(path, cc.Prefab);
        if (Array.isArray(prefab)) return;
        return prefab;
    }
    getAtlasByName(name, pathType?: string): cc.SpriteAtlas {
        const path = this.getPath(`plist/${name}`, pathType);
        const atlas = cc.loader.getRes(path, cc.SpriteAtlas);
        if (Array.isArray(atlas)) return;
        return atlas;
    }
    async getSpriteFrame(name, pathType?: string): Promise<cc.SpriteFrame> {
        const path = this.getPath(`sprite/${name}`, pathType);
        const sprite = await this.getRes(path, cc.SpriteFrame);
        if (Array.isArray(sprite)) return;
        return sprite;
        // if (sprite.textureLoaded && sprite.rawUrl.length) {
        //     return sprite;
        // }
        // if (sprite.url && sprite.url.length) {
        //     const frame = new cc.SpriteFrame(sprite);
        //     return frame;
        // }
    }
    getAudioClip(name, pathType?: string): cc.AudioClip {
        const path = this.getPath(`${name}`, pathType);
        return cc.loader.getRes(path, cc.AudioClip);
    }

    async getJsonAll(name): Promise<any> {
        return await this.loadResDir(name);
    }

    async loadResDir(path, cb?: Function) {
        return new Promise((resolve, reject) => {
            if (!tool.startWith(path, 'config') && this.loaded[path]) {
                return resolve(this.loaded[path]);
            }
            cc.loader.loadResDir(
                path,
                (completedCount: number, totalCount: number, item: any) => {
                    if (cb) cb(completedCount, totalCount, item);
                },
                (err, consts) => {
                    if (err) {
                        return reject(err);
                    }
                    this.loaded[path] = true;
                    resolve(consts);
                },
            );
        });
    }

    async getRes(path, type?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const existRes = cc.loader.getRes(path, type);
            if (existRes) return resolve(existRes);
            cc.loader.loadRes(path, type, (err, res) => {
                if (res) {
                    return resolve(res);
                }
                reject(`loadRes faild:${err}`);
            });
        });
    }

    async loadRes(path, type?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(path, type, (err, res) => {
                if (res) {
                    return resolve(res);
                }
                reject(`loadRes faild:${err}`);
            });
        });
    }

    async load(url: string, type?: string) {
        // if (CC_DEBUG) return await this.getRes(url, type);
        return new Promise((resolve, reject) => {
            cc.loader.load({ url, type }, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }

    getPath(path: string, pathType?: string) {
        if (pathType) {
            path = `${pathType}/${path}`;
        } else {
            path = `${ResPath.DefaultPatch}/${path}`;
        }
        return path;
    }
    hasloaded(sceneName: string, ...dirPaths: string[]) {
        if (!this.loaded[sceneName]) return false;
        for (const dir of dirPaths) {
            if (!this.loaded[dir]) return false;
        }
        return true;
    }

    async dialogLoadScene(sceneName: string, cb?: Function) {
        cc.loader.onProgress = (completedCount: number, totalCount: number, item: any) => {
            if (cb) {
                cb(completedCount, totalCount, item);
            }
        };
        await this.loadSceneOnLaunched(sceneName);
    }

    async preLoadScene(sceneName: string, cb: Function) {
        return new Promise((resolve, reject) => {
            if (this.loaded[sceneName]) return resolve(true);
            const onProgress = (completedCount: number, totalCount: number, item: any) => {
                if (cb) {
                    cb(completedCount, totalCount, item);
                }
            };
            cc.director.preloadScene(sceneName, onProgress, err => {
                if (err) return reject(err);
                this.loaded[sceneName] = true;
                resolve(true);
            });
        });
    }

    async loadSubpackage(name: string) {
        return new Promise((resolve, reject) => {
            if (this.loadedSubs[name]) return resolve();
            if (tool.isWechatGame()) {
                cc.loader.downloader.loadSubpackage(name, err => {
                    if (err) {
                        reject();
                        return console.error(err);
                    }
                    this.loadedSubs[name] = true;
                    resolve();
                    console.log('load subpackage successfully.');
                });
            } else {
                this.loadedSubs[name] = true;
                resolve();
            }
        });
    }

    async loadRequireSub() {
        // await this.loadSubpackage('share-script');
        await this.loadSubpackage('dialog-script');
    }

    /**
     *
     * @param type 创建一个dcomponent
     */
    public async loadDComponent<T>(type: { prototype: T } | string): Promise<T> {
        type = this.getClass(type);
        if (typeof type === 'function') {
            const comp = await (type as any).loadPackage();
            let dcomponent;
            if (!comp) {
                dcomponent = new (type as any)();
            } else {
                dcomponent = comp;
            }
            comp.onConstructor();
            return dcomponent;
        }
        throw 'type is not a constructor';
    }

    /** 获取类型 */
    public getClass<T>(type: { prototype: T } | string): any {
        if (typeof type === 'string') {
            type = cc.js.getClassByName(type);
        }
        return type;
    }

    gameRestart() {
        pom.clearPool();
        this.loadedSubs = {};
        cc.game.restart();
    }

    /**
     * load 大厅
     */
    showHallSene(cb?) {
        if (this.sceneName !== SceneName.HALLSCENE) {
            this.loadScene(SceneName.HALLSCENE, cb);
            console.log('T出房间');
        }
    }

    /**
     * load场景
     * @param sceneName
     * @param cb
     */
    async loadScene(sceneName: string, cb?: Function) {
        return new Promise((resolve, reject) => {
            if (sceneName === SceneName.HALLSCENE && this.sceneName === SceneName.ROOMSCENE)
                this.loadingState = LoadingState.RoomToHall;
            if (sceneName === SceneName.HALLSCENE && this.sceneName === SceneName.LOGINSCENE)
                this.loadingState = LoadingState.LoginToHall;
            else if (sceneName === SceneName.LOGINSCENE && this.sceneName === SceneName.HALLSCENE)
                this.loadingState = LoadingState.HallToLogin;
            if (this.sceneName !== sceneName) {
                cc.director.loadScene(sceneName, res => {
                    if (cb) cb();
                    if (res) return reject(res);
                    times.clearLoadTimer();
                    this.sceneName = sceneName;
                    console.info('load scene success:', sceneName);
                    resolve(res);
                });
                pom.clearQueue();
            }
        });
    }

    /**
     * @param sceneName
     */
    async loadSceneOnLaunched(sceneName) {
        return new Promise((resolve, reject) => {
            if (sceneName) {
                this.loaded[sceneName] = true;
                this.loadScene(sceneName, () => {
                    cc.loader.onProgress = null;
                    resolve(true);
                });
            }
        });
    }

    /**
     * 房间返回大厅
     */
    public isRoomToHall() {
        return this.loadingState === LoadingState.RoomToHall;
    }

    /**
     * 登录界面返回大厅
     */
    public isLoginToHall() {
        return this.loadingState === LoadingState.LoginToHall;
    }

    /**
     * 登录登录界面
     */
    public isFisrtLogin() {
        return this.loadingState === LoadingState.FirstLogin;
    }

    /**
     * 是否在登录界面
     */
    public isLoginScene() {
        return this.sceneName === SceneName.LOGINSCENE;
    }

    /**
     * 是否是在大厅
     */
    public isHallScene() {
        return this.sceneName === SceneName.HALLSCENE;
    }

    /**
     * 是否是在房间界面
     */
    public isRoomScene() {
        return this.sceneName === SceneName.ROOMSCENE;
    }
}

export enum LoadingState {
    FirstLogin, // 第一次进入
    LoginToHall = 1,
    RoomToHall,
    HallToLogin,
}

export const rem = new ResManager();
