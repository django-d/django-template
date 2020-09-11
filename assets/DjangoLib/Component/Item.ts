import { DComponent } from '../Base/DComponent';

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class Item extends DComponent {

    index: number = null;

    public abstract updateData(data, index);

    onDestroy() {
        super.onDestroy();
    }

}
