
export function numberWithCommas(input: string | number) {
    return input ? input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '';
}