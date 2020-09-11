export default class IQueue {
    public dataStore: any[] = [];

    /**
     * 向数组尾部添加元素
     * @param element
     */
    public add<T>(element: T) {
        this.dataStore.push(element);
    }

    /**
     * 向数组开头添加元素
     * @param element
     */
    public unshift<T>(element: T) {
        this.dataStore.unshift(element);
    }
    /**
     * 获取第一个元素 并从队列中删除
     */
    public getFirst<T>(): T {
        return this.dataStore.shift();
    }
    /**
     * 获取第最后元素 并从队列中删除
     */
    public getEnd<T>(): T {
        return this.dataStore.pop();
    }
    /**
     * 查看第一个元素
     */
    public first<T>(): T {
        return this.dataStore[0];
    }
    /**
     * 查看最后一个元素
     */
    public end<T>(): T {
        if (this.isEmpty) return null;
        return this.dataStore[this.dataStore.length - 1];
    }

    public isEmpty(): boolean {
        if (this.dataStore.length) {
            return false;
        }
        return true;
    }

    public clear() {
        if (this.dataStore && this.dataStore.length) {
            this.dataStore.splice(0, this.dataStore.length);
        }
    }

    /**
     * 获取
     * @param key
     * @param value
     */
    public getElementByKey(key: string, value: any) {
        if (this.dataStore) {
            for (const iterator of this.dataStore) {
                if (iterator[key] === value) return iterator;
            }
        }
    }
}
