

export const mobileValidation = (mobile) => {
    var regex = new RegExp("^(\\+98|0)?9\\d{9}$");
    var result = regex.test(mobile);
    console.log(result, 'reslulsllsllsll')
    return result;
}