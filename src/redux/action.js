export const setTransection = (data,dispatch)=>{
    console.log('action data',data)
    dispatch({
        type: 'TRANSECTION',
        data: data
    })
}