import { CCWindow } from "../DjangoLib/Base/CCWindow";
import { eventHandler } from "../DjangoLib/Descript/eventDecorator";
import { dclass } from "../DjangoLib/Descript/dclass";
import { ccWindow } from "../DjangoLib/Descript/WindowDecorator";



const { ccclass, property } = cc._decorator;

@dclass({uiPackage:'test'})
@eventHandler()
@ccWindow({ isShadowClick: true })
export default class TestDialog extends CCWindow {

}