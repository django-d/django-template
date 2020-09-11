import { InfinityMapMaterial } from './Tttt';

const { ccclass, property } = cc._decorator;
@ccclass
export default class InfinityMap extends cc.Component {
    _material = null;

    onEnable() {
        let sprite = this.getComponent(cc.Sprite);
        // sprite._assembler = InfinityAssembler;
        sprite._assembler.updateRenderData = sprite => {
            let frame = sprite._spriteFrame;

            // TODO: Material API design and export from editor could affect the material activation process
            // need to update the logic here
            if (frame) {
                if (sprite._material._texture !== frame._texture) {
                    sprite._activateMaterial();
                }
            }

            let renderData = sprite._renderData;
            if (renderData && frame) {
                if (renderData.vertDirty) {
                    sprite._assembler.updateVerts(sprite);
                }
            }
        };
        let material: InfinityMapMaterial = new InfinityMapMaterial();
        material.texture = sprite.spriteFrame.getTexture();
        sprite._updateMaterial(material);
        // 纹理的宽高要为2的n次幂才能使用repeat
        material.texture.setWrapMode(cc.Texture2D.WrapMode.REPEAT, cc.Texture2D.WrapMode.REPEAT);

        this._material = material;
    }

    update(dt) {
        let uvSpeed = this._material.uvSpeed;
        uvSpeed.x += 0.001;
        this._material.uvSpeed = uvSpeed;
    }
}
