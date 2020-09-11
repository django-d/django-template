export class SceneName {
    public static ROOMSCENE: string = 'RoomScene';
    public static HALLSCENE: string = 'HallScene';
    public static LOGINSCENE: string = 'LoginScene';
    public static MATCHSCENE: string = 'MatchScene';
}

export class Sex {
    public static MALE: number = 1;
    public static FEMALE: number = 2;
}

export class ResPath {
    public static DefaultPatch: string = 'django';
    public static RoomPatch: string = 'room';
    public static GamePatch: string = 'game';
    public static TLJPatch: string = 'game/tlj';
    public static DDZPatch: string = 'game/ddz';
    public static PDKPatch: string = 'game/pdk';
    public static BHPatch: string = 'game/bh';
}

export enum CCZindex {
    /**
     * 菊花loading
     */
    ILoading = 10000,

    /**
     * toast
     */
    IToast = 30000,

    /**
     * 签到弹窗
     */
    SignInDialog = 8800,

    /**
     * 选择弹窗
     */
    ChooseDialog = 8801,

    /**
     * 现金红包弹窗
     */
    CashRedPacketDialog = 8802,

    /**
     * 反馈弹窗
     */
    FeedBackTipDialog = 8810,

    /**
     * 获得物品
     */
    GettingThingsDialog = 8811,

    /**
     * 加载弹窗
     */
    LoadingDialog = 8820,

    /**
     * 获取玩家授权遮罩
     */
    GetUserInfoDialog = 8840,

    /**
     *  提示弹窗
     */
    HintDialog = 8850,
}

export enum PopEventsEnum {
    /**
     * 弹出alert(无回调)
     */
    ALERT_POP = 'ALERT_POP',

    /**
     * 弹出alert回调回大厅
     */
    ALERT_POP_BACKTOHALL = 'ALERT_POP_BACKTOHALL',

    /**
     * 弹出alert回调回H5大厅
     */
    ALERT_POP_BACKTOH5 = 'ALERT_POP_BACKTOH5',

    /**
     * 弹出toast(无回调)
     */
    TOAST_POP = 'TOAST_POP',

    /**
     * 设置网络连接Loading
     */
    LOADING_POP_SET = 'LOADING_POP_SET',

    /**
     * 移除网络连接loading
     */
    Close_Waiting_Loading = 'Close_Waiting_Loading',

    /**
     * 显示弹窗
     */
    SHOW_DIALOG = 'SHOW_DIALOG',

    /** 显示游客列表 */
    SHOW_GUEST_LIST_UI = 'SHOW_GUEST_LIST_UI',

    /**
     * 刷新游客列表
     */
    UPDATE_GUEST_LIST = 'UPDATE_GUEST_LIST',

    /** 聊天UI */
    SHOW_CHAT_UI = 'SHOW_CHAT_UI',

    /**
     * 关闭解散弹窗
     */
    Close_Dissolve_Dialog = 'Close_Dissolve_Dialog',
    /**
     * 关闭旋转屏幕
     */
    Close_Orientation_Dialog = 'Close_Orientation_Dialog',

    /**
     * 关闭玩家信息
     */
    Close_UserInfo_Dialog = 'Close_UserInfo_Dialog',

    /**
     * 关闭转圈
     */
    Close_IActivity = 'Close_IActivity',

    /**
     * 关闭hint
     */
    Close_Hint_Dialog = 'Close_Hint_Dialog',

    /**
     * 关闭用户授权弹窗
     */
    Close_GetUserInfo_Dialog = 'Close_GetUserInfo_Dialog',

    /**
     * 关闭匹配弹窗信息
     */
    Close_AreMatching_Dialog = 'Close_AreMatching_Dialog',

    /**
     * 移除听dialog
     */
    Close_Ting_Dialog = 'Close_Ting_Dialog',

    /**
     * 隐藏截图按钮
     */
    Show_Print_Screen_Btn = 'Show_Print_Screen_Btn',

    /**
     * 点击返回按钮
     *
     */
    Click_Wechat_Back_Btn = 'Click_Wechat_Back_Btn',

    /**
     * 刷新历史详情
     */
    Refresh_History_Detail = 'Refresh_History_Detail',
}
