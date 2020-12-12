let HermesContract;

setup();

// if (window.ethereum) {
//     window.ethereum
//     .request({ method: 'eth_requestAccounts' });
// } else {
//     console.error('No wallet extension found!');
// }

function setup(){
    window.web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.matic.today'));
    HermesContract = new web3.eth.Contract(contractABI, contractAddress);
    setupPostsUI();

    document.querySelector(".search__input").addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        event.preventDefault();
        if (event.key == 'Enter') {
          window.location.href = `./index.html?search=${document.querySelector(".search__input").value}`
        }
      });
}


async function setupPostsUI(){

    let q = '';
    if(getParameterByName('search') !== null ){
        q= getParameterByName('search');
        document.getElementById('search-query').innerText = getParameterByName('search');
    }

    getPostsbyString(q).then((posts)=>{
        console.log(posts);
        posts.forEach(post => {
            document.querySelector('.grid').innerHTML += `
                <div class="grid__item" data-size="1280x857">
                    <a href="https://gateway.pinata.cloud/ipfs/${post.postData}" class="img-wrap">
                        <img src="https://gateway.pinata.cloud/ipfs/${post.postData}" alt="img06" />
                        <div class="description description--grid">
                            <h3>${post.metaData}</h3>
                            <br/>
                            <div class="details">
                                <ul>
                                    <li><button>Purchase</button></li>
                                    <li><button onclick="openExp('${post.seller}')">View Author</button></li>
                                </ul>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        });

    }).then(()=>{
        setupGridSystem();
    })
}


async function getPostsbyString(query = '', limit = 15){
    let promise = new Promise((res, rej) => {

        HermesContract.getPastEvents('NewPost', {
            filter: {},
            fromBlock: contractBlockNumber,
            toBlock: 'latest'
        })
        .then((events) => {
            let validEvents = []
            for(var i=0;i < Math.min(events.length, limit); i++){
                if (cleanNewPostEvent(events[i]).metaData.toLowerCase().includes(query.toLowerCase())){
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

function getParameterByName(name) {
    url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function openExp(add){
    window.open('https://explorer-mumbai.maticvigil.com/address/'+add, '_blank');
}

function toggleDarkTheme(add){
    if(document.querySelector('.main-wrap').classList.contains('dark') === true){
        document.querySelector('.main-wrap').classList.remove('dark');
        document.querySelector('#search-icon-fill').setAttribute('fill', '#000');
        document.querySelector('#light-icon-fill').setAttribute('fill', '#000');
    }
    else{
        document.querySelector('.main-wrap').classList.add('dark');
        document.querySelector('#search-icon-fill').setAttribute('fill', '#fff');
        document.querySelector('#light-icon-fill').setAttribute('fill', '#fff');

    }
}
