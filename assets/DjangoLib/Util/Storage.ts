
 export default class Storage {
     failMap: any = {};

    // tslint:disable-next-line:ban-types
    public  setItem(name: string, value: String | Object) {
        this.removeItem(name);
            try {
                this.failMap[name] = value;
                cc.sys.localStorage.setItem(name, value);
            } catch (error) {
                console.error('Storage: error', error);
            }
    }

    public  getItem(key: string) {
            try {
                return cc.sys.localStorage.getItem(key) || this.failMap[key];
            } catch (error) {
                return this.failMap[key];
            }
    }
    public  removeItem(key: string) {
            try {
                return cc.sys.localStorage.removeItem(key);
            } catch (error) {
                return null;
            }
    }

    public  getHostName() {
        return location.host.substr(location.host.indexOf('.') + 1);
    }
}
