let HermesContract;

if (window.ethereum) {
    // window.ethereum.enable();
    window.ethereum
    .request({ method: 'eth_requestAccounts' });
    setup();
} else {
    console.error('No wallet extension found!');
}

function setup(){
    window.web3 = new Web3(ethereum);
    HermesContract = new web3.eth.Contract(contractABI, contractAddress);
}

async function getPostsbyString(query = ''){
    let promise = new Promise((res, rej) => {

        HermesContract.getPastEvents('NewPost', {
            filter: {},
            fromBlock: contractBlockNumber,
            toBlock: 'latest'
        })
        .then((events) => {
            let validEvents = []
            for(var i=0;i<events.length;i++){
                if (events[i].returnValues._metaData.includes(web3.utils.fromAscii(query))){
                    validEvents.push(cleanNewPostEvent(events[i]));
                }
            }
            res(validEvents);
        })
        .catch(function(error){
           rej(error);
        });

    });
    let result = await promise;
    return result;
}

function cleanNewPostEvent(event){
    return {
        'metaData':web3.utils.toAscii(event.returnValues._metaData).trim(),
        'postData':event.returnValues._postData,
        'postId':event.returnValues._postId,
        'price':web3.utils.fromWei(event.returnValues._price) + " ETH",
        'seller':event.returnValues._seller
    }
}
