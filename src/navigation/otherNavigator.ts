import { ChatScreen, CitySelectionScreen, CodeInput, CreateAddsPayScreen, CreateJobHelperScreen, CreateJobScreen, CreateOfferMarketPay, CreateOfferMarketScreen, CreateOfferScreen, FilterScreen, RegisterScreen, SingleJobCategoryScreen, SingleJobScreen, SingleOfferScreen, SinlgeProduct, SplashScreen, UserPanelScreen } from "../screens";
import { UserOfferMarketScreen } from "../screens/others/user-offer-market";

export const routes = [
    {
        name: "splash",
        component: SplashScreen
    },
    {
        name:'register',
        component: RegisterScreen
    },
    {
        name:'codeInput',
        component: CodeInput
    },
    {
        name:'citySelection',
        component: CitySelectionScreen
    },
    {
        name:'singleProduct',
        component: SinlgeProduct
    },
    {
        name:'singleJobCategory',
        component: SingleJobCategoryScreen
    },
    {
        name:'singleJob',
        component: SingleJobScreen
    },
    {
        name:'createJob',
        component: CreateJobScreen
    },
    {
        name:'createJobHelper',
        component: CreateJobHelperScreen
    },
    {
        name:'singleOffer',
        component: SingleOfferScreen
    },
    {
        name:'createOfferMarket',
        component: CreateOfferMarketScreen
    },
    {
        name:'createOfferMarketPay',
        component: CreateOfferMarketPay
    },
    {
        name:'userOfferMarketScreen',
        component: UserOfferMarketScreen
    }
    ,
    {
        name:'createOffer',
        component: CreateOfferScreen
    },
    {
        name:'createAddsPay',
        component: CreateAddsPayScreen
    },
    {
        name:'userpanel',
        component: UserPanelScreen
    },
    {
        name:'chat',
        component: ChatScreen
    },
    {
        name:'filter',
        component: FilterScreen
    }

]