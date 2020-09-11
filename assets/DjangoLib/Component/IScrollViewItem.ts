import Item from './Item';

const { ccclass, property } = cc._decorator;

@ccclass
export default class IScrollViewItem extends Item {
    @property(cc.Label)
    text: cc.Label = null;

    index: number = null;

    updateData(data, index) {
        this.index = index;
        this.text.string = data;
    }
}
