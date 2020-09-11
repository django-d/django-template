const renderEngine = cc.renderer.renderEngine;
const Material = renderEngine.Material;

let vert = `
uniform mat4 viewProj;
attribute vec3 a_position;
attribute mediump vec2 a_uv0;
varying mediump vec2 uv0;
void main () {
    vec4 pos = viewProj * vec4(a_position, 1);
    gl_Position = pos;
    uv0 = a_uv0;
}`;

let frag = `
uniform vec2 u_uvSpeed;
uniform sampler2D texture;
varying mediump vec2 uv0;
uniform lowp vec4 color;
void main () {
    vec4 c = color * texture2D(texture, uv0 + u_uvSpeed);
    // float gray = 0.2126*c.r + 0.7152*c.g + 0.0722*c.b;
    // gl_FragColor = vec4(gray, gray, gray, c.a);
    gl_FragColor = c;
}`;

export class InfinityMapMaterial extends Material {
    constructor() {
        super(false);
        let name = 'infinitymap';
        let lib = cc.renderer._forward._programLib;
        !lib._templates[name] && lib.define(name, vert, frag, []);

        let renderer = renderEngine.renderer;
        let gfx = renderEngine.gfx;

        // 渲染通道
        let pass = new renderer.Pass(name);
        pass.setDepth(false, false);
        pass.setCullMode(gfx.CULL_NONE);
        pass.setBlend(
            gfx.BLEND_FUNC_ADD,
            gfx.BLEND_SRC_ALPHA,
            gfx.BLEND_ONE_MINUS_SRC_ALPHA,
            gfx.BLEND_FUNC_ADD,
            gfx.BLEND_SRC_ALPHA,
            gfx.BLEND_ONE_MINUS_SRC_ALPHA,
        );

        let mainTech = new renderer.Technique(
            ['transparent'],
            [
                { name: 'texture', type: renderer.PARAM_TEXTURE_2D },
                { name: 'color', type: renderer.PARAM_COLOR4 },
                { name: 'u_uvSpeed', type: renderer.PARAM_FLOAT2 },
            ],
            [pass],
        );

        this._color = { r: 1, g: 1, b: 1, a: 1 };
        this._uvSpeed = { x: 0, y: 0 };

        this._effect = new renderer.Effect(
            [mainTech],
            {
                color: this._color,
            },
            [],
        );
        this._mainTech = mainTech;
        this._texture = null;
    }

    get effect() {
        return this._effect;
    }
    get texture() {
        return this._texture;
    }
    set texture(val) {
        if (this._texture !== val) {
            this._texture = val;
            this._effect.setProperty('texture', val.getImpl());
            this._texIds['texture'] = val.getId();
        }
    }

    get color() {
        return this._color;
    }
    set color(val) {
        let color = this._color;
        color.r = val.r / 255;
        color.g = val.g / 255;
        color.b = val.b / 255;
        color.a = val.a / 255;
        this._effect.setProperty('color', color);
    }

    get uvSpeed() {
        return this._uvSpeed;
    }

    set uvSpeed(v) {
        this._uvSpeed.x = v.x;
        this._uvSpeed.y = v.y;
        this._effect.setProperty('u_uvSpeed', this._uvSpeed);
    }
}
