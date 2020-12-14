let maticMumbaiProvider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.matic.today');
let HC_interface = new ethers.utils.Interface(contractABI);
let HermesContract = new ethers.Contract(contractAddress, contractABI, maticMumbaiProvider);

setup();

// if (window.ethereum) {
//     window.ethereum
//     .request({ method: 'eth_requestAccounts' });
// } else {
//     console.error('No wallet extension found!');
// }

function setup(){
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
                    <a href="https://gateway.pinata.cloud/ipfs/${post._postData}" class="img-wrap">
                        <img src="https://gateway.pinata.cloud/ipfs/${post._postData}" alt="img06" />
                        <div class="description description--grid">
                            <h3>#${post._postId.toString()} ${ethers.utils.parseBytes32String(post._metaData)}</h3>
                            <br/>
                            <div class="details">
                                <ul>
                                    <li><button class='hover-rainbow' onclick="purchasePost(${post._postId}, ${post._price})">Purchase for ${ethers.utils.formatEther(post._price)} ETH</button></li>
                                    <li><button onclick="openExp('${post._seller}')">View Author</button></li>
                                </ul>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        });

    }).then(()=>{
        document.querySelector('#search-query').innerHTML = `Let's <span class="rainbow">Explore</span>`;
        setupGridSystem();
    })
}


async function getPostsbyString(query = '', limit = 15){
    let promise = new Promise((res, rej) => {

        let topic = ethers.utils.id("NewPost(uint256,address,uint256,string,bytes32)");
        let filter = {
            address: contractAddress,
            fromBlock: contractBlockNumber,
            toBlock: 'latest',
            topics: [topic]
        }

        maticMumbaiProvider.getLogs(filter).then((events) => {
            let validEvents = []
            for(var i=0;i < Math.min(events.length, limit); i++){
                let decodedEventData = HC_interface.decodeEventLog(topic, events[i].data, events[i].topics);
                try{
                    let decodedString = ethers.utils.parseBytes32String(decodedEventData._metaData);
                    if (decodedString.toLowerCase().includes(query.toLowerCase())){
                        validEvents.push(decodedEventData);
                    }
                }
                catch {
                    continue;
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

function injectScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.addEventListener('load', resolve);
        script.addEventListener('error', e => reject(e.error));
        document.head.appendChild(script);
    });
}

async function purchasePost(postID, postCost){
    if (typeof window.ethereum !== 'undefined') {
        await ethereum.request({ method: 'eth_requestAccounts' });
        let provider = (new ethers.providers.Web3Provider(ethereum)).getSigner();
        let HC = new ethers.Contract(contractAddress, contractABI, provider);

        await HC.purchasePost(postID,{
            value: postCost
        }).then(console.log).then(tx=>{
            console.log('txn hash', tx);
            alert(`Post ${postID} purchased!`);
        }).catch((e)=>{
            alert(e.message);
        });
    }
    else if(typeof window.web3 !== 'undefined'){
        await web3.currentProvider.enable()
        let provider = (new ethers.providers.Web3Provider(web3.currentProvider)).getSigner();
        let HC = new ethers.Contract(contractAddress, contractABI, provider);

        await HC.purchasePost(postID,{
            value: postCost
        }).then(console.log).then(tx=>{
            console.log('txn hash', tx);
            alert(`Post ${postID} purchased!`);
        }).catch((e)=>{
            alert(e.message);
        });

    }
    else {

        injectScript('https://cdn.jsdelivr.net/npm/@portis/web3@2.0.0-beta.59/umd/index.js')
        .then(async () => {
            console.log('Portis Injected.');

            const portis = new Portis('d1c90676-4267-4747-845f-438ab42e3f6a', 'maticMumbai');
            let provider = (new ethers.providers.Web3Provider(portis.provider)).getSigner();
            let HC = new ethers.Contract(contractAddress, contractABI, provider);

            await HC.purchasePost(postID,{
                value: postCost
            }).then(console.log).then(tx=>{
                console.log('txn hash', tx);
                alert(`Post ${postID} purchased!`);
            }).catch((e)=>{
                alert(e.message);
            });

        }).catch(error => {
            console.error(error);
        });

    }

}


