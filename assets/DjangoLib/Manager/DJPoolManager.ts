import { DComponent } from '../Base/DComponent';
import { rem } from './DJResManager';

/**
 * 对象池管理类
 * @author django
 * @date 2020/9/10
 */
export class DJPoolManager {
    private static _instance: DJPoolManager;
    private _nodePoolMap;

    public static getInstance() {
        if (!this._instance) {
            this._instance = new DJPoolManager();
        }
        return this._instance;
    }

    getNodePool(name: string): cc.NodePool {
        if (!this._nodePoolMap[name]) this._nodePoolMap[name] = new cc.NodePool(name);
        return this._nodePoolMap[name];
    }

    /** 获取节点对象池中的节点 */
    public async getNodeByName<T extends DComponent>(type: { prototype: T } | string): Promise<any> {
        let index = -1;

        const key = typeof type === 'function' ? (type as any).cname : type;

        const pool = this.getNodePool(key);

        let node = pool.get();

        if (node) {
            if (node && cc.isValid(node)) {
                return node;
            }
        }
        // 对象池中没有node
        return await rem.loadDComponent(type);
    }

    // 清除对象池中的节点
    clearNodePool() {
        Object.keys(this._nodePoolMap).forEach(key => {
            const pool = this._nodePoolMap[key] as cc.NodePool;
            if (pool) {
                pool.clear();
            }
        });
    }
}

export const poolm = DJPoolManager.getInstance();
