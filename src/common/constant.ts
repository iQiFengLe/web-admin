
// 权重
export const MAX_WEIGHT = 9999999
export const MIN_WEIGHT = 1
export const FORM_RULE_WEIGHT = [
    { type: 'number', min: MIN_WEIGHT, message: `权重不可低于：${MIN_WEIGHT}！` },
    { type: 'number', max: MAX_WEIGHT, message: `权重不可高于：${MAX_WEIGHT}！` }
]