const Transection = [];

export const reducer = (state = Transection, action)=>{
    switch (action.type) {
        case 'TRANSECTION':
            return[
                ...state,
                ...action.data
    ];
        default:
            return state;
           
    }
}