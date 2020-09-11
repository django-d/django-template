import { ResPath } from '../Consts/Consts';
import VMDJState from '../ModelView/VMDJState';
import IButton from '../Component/IButton';
import IToggle from '../Component/IToggle';
import IScrollView from '../Component/IScrollView';

const { ccclass, property } = cc._decorator;
/**
 */

export function dclass(option?: { uiPackage?: string; name?: string; prefabName?: string }) {
    return <T>(constructorFunction: T): any => {
        if (!option) option = {};
        const comp = ccclass(constructorFunction as any) as any;
        comp.uiPackage = option.uiPackage || ResPath.DefaultPatch;
        comp.cname = option.name || cc.js.getClassName(comp);
        comp.prefabName = option.prefabName || option.name;
        return comp;
    };
}

export interface DNode extends cc.Node {
    $Label: cc.Label;
    $Sprite: cc.Sprite;
    $Button: cc.Button;
    $Animation: cc.Animation;
    $Toggle: cc.Toggle;
    $IToggle: IToggle;
    $ScrollView: cc.ScrollView;
    $Layout: cc.Layout;
    $RichText: cc.RichText;
    $ArmatureDisplay: dragonBones.ArmatureDisplay;
    $IScrollView: IScrollView;
    $IButton: IButton;
    $VMDJState: VMDJState;
}
