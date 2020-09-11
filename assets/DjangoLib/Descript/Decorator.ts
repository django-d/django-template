// 动态监听路径
export function WPath(data: IWPath) {
    console.log('添加路径 :', data);
    return (target: any, key: string) => {
        let value = target[key];
        Object.defineProperty(target, key, {
            get: () => {
                if (!value) return;
                Object.keys(data).forEach(key => {
                    console.log(key);
                    value[key] = data[key];
                });
                return value;
            },
            set: v => {
                value = v;
            },
        });
    };
}

export interface IWPath {
    labelwp: string; // label 监听路径
}
