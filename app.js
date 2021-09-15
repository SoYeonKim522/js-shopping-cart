//https://www.youtube.com/watch?v=90PgFUPIybY
//클래스 메인으로 사용한 첫 프로젝트

const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "ac86e5gcwwpp",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "Hc3rrLfA6VBUHUp3VeMNn3khbaSvQQGczSYskGwyCEc"
});
console.log(client)


const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('close-cart');
const clearCartBtn = document.querySelector('.clear-cart');  //아직 없는데 어떻게 선ㄴ택가능한거임? -- 있는데..?
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');

const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//cart
let cart = [];
let buttonsDOM = []

//getting the products
class Products{  //객체 만들기 위한 클래스(코드 그룹화. js에서 class는 함수임)
    async getProducts(){  //생성자 말고 메소드 셋업. async->.then 등 사용가능
        try{
            let contentful = await client.getEntries({       
                content_type: 'comfyHouseProducts'      //이 파일 안에 있는 데이터만 가져오겠다
            })

            //let result = await fetch('products.json');  //fetch 할때까지 기다려라. (product 앞에 ./ (X))
            //let data = await result.json();
            let products = contentful.items; //let products = data.items;          // = 데이터 배열. data에서 그냥 맵핑하는게 아니라 배열만 매핑이 가능하므로 배열롤 지정해줘야함
            products = products.map(item => {   //json구조가 복잡해서 좀 단순화하기 위해 하는 과정
                const { title, price } = item.fields;  //destructuring
                const { id } = item.sys;               //destructuring
                const image = item.fields.image.fields.file.url;  //image에는 중괄호X - 왜?--구조분해 아니라서
                return {title, price, id, image}    //이렇게 단순화해서 필요한정보만 뽑아오기
            })
            return products ; //여기서 리턴을 또 해야함
            
        } catch(error){
            console.log(error)
        }
    }
}


//display on browser
class UI{       // contains 3 main methods  - 이 세가지는 domcontentloaded될때 실행시켜줄 예정이라  메인과 마이너 메소드들을 구분해서 생각해야함
    displayProducts(products){ //1. 각 상품들을 화면에 그려주는 메소드
        let result = '';
        console.log(products)
        products.forEach(product => {
            result += `<article class="product">
                <div class="img-container">     
                    <img src=${product.image} alt="product" class='product-img'>
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i> add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
            </article>`
        });
        productsDOM.innerHTML = result; 
    }
    getBagButtons(){        //2. 'add to cart'버튼 관련 메소드
        const buttons = [...document.querySelectorAll('.bag-btn')];  //spread를 통해서 type변경: nodelist -> array  
        buttonsDOM = buttons;  //빈배열(buttonsDOM)에 모든 buttons 일단 넣기
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);  
            if(inCart) { //카트에 담겼다면(처음 로딩했을 때 이미 담긴 상태라면)
                button.innerText = 'In Cart';
                button.disabled = true;
            } 
            button.addEventListener('click', (e) => {
                e.target.innerText = 'In Cart';
                e.target.disabled = true;
                //get that product from local storage
                let cartItem = {...Storage.getProducts(id), amount:1}  //Storage의 static메소드를 객체가 되게 하고, 거기에 amount라는 속성 추가해서 넣은것->이후 amount에 접근 가능하게 되는듯
                //storage.getProducts(id)의 반환값은 어차피 하나인데 왜 스프레드? &왜객체?
                //근데 왜 카트에 담을 아이템을 스토리지에서 가져오는거?
                console.log(cartItem)
                //add product to the cart
                cart = [...cart, cartItem];
                //save cart in local storage
                Storage.saveCart(cart);
                //set cart values
                this.setCartValues(cart);  //아래 메소드 따로 만들기
                //display cart item
                this.addCartItem(cartItem);                
                //show the cart
                this.showCart();
                })
        });
    }
        setCartValues(cart){    //총 가격, 갯수 핸들링
            let tempTotal = 0;  // 총 가격
            let itemsTotal = 0; // 상품 갯수
            cart.map(item => {
                tempTotal += item.price * item.amount;
                itemsTotal += item.amount;
            })
            cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
            cartItems.innerText = itemsTotal;
        }
        addCartItem(item){      //카트에 아이템 실제로 추가
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML =  `<img src=${item.image} alt="product">
                                <div>
                                    <h4>${item.title}</h4>
                                    <h5>${item.price}</h5>
                                    <span class="remove-item" data-id=${item.id}> remove</span>
                                </div>
                                <div>
                                    <i class="fas fa-chevron-up" data-id=${item.id}></i>
                                    <p class="item-amount">${item.amount}</p>
                                    <i class="fas fa-chevron-down" data-id=${item.id}></i>
                                </div>`
            cartContent.appendChild(div)   //여기서는 innerhtml아니고 appendchild!
        } 
        showCart(){
            cartOverlay.classList.add('transparentBcg');
            cartDOM.classList.add('showCart');
        }
        setupAPP() {   //처음 로딩할때 셋업
            cart = Storage.getCart();       //update cart from local storage
            this.setCartValues(cart);       //총가격,갯수 관련 메소드 재사용
            this.populateCart(cart);        //모든 아이템에 대해 addCartItem
            cartBtn.addEventListener('click', this.showCart);
            //closeCartBtn.addEventListener('click', this.hideCart);
        }
        populateCart(cart){
            cart.forEach(item => this.addCartItem(item));
        }
        hideCart(){
            cartOverlay.classList.remove('transparentBcg');
            cartDOM.classList.remove('showCart');
        }

    cartLogic(){        //3. 상품 클리어 & 갯수 조절 관련 메소드
        //clear cart button
        clearCartBtn.addEventListener('click', () => {  //이 경우 이렇게 화살표로 추가해야지 this.clearCart로 쓰면 this. 가 UI를 가르키지 않게됨!중요
            this.clearCart()
        })
        /* DOESNT WORK
        closeCartBtn.addEventListener('click', () => {
            this.hideCart()
        });*/
        //cart functionality : 상품갯수 변경/삭제__cartContent에 이벤트를 주고 이벤트 버블링 이용예정: e.target의 class에 따라 다른 기능수행하도록
        cartContent.addEventListener('click', e => {
            if(e.target.className === 'remove-item'){
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement)  //remove from DOM(화면)
                this.removeItem(id);             //remove from the cart 메소드 재사용
            } else if(e.target.className === 'fas fa-chevron-up'){
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id===id); //update cart
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);                         //save updated cart to LS
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText =  tempItem.amount; //nextSibiling은 text node에 접근함
            } else if(e.target.className === 'fas fa-chevron-down'){
                let lowerAmount = e.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id===id); //update cart
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){ 
                    Storage.saveCart(cart);                //save updated cart to LS
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText =  tempItem.amount; //nextSibiling은 text node에 접근함
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            } 
            })
            /*  close 버튼만 작동안돼서 이렇게 했더니 close는 되는데 다른 모든게 안됨ㅋ
        cartDOM.addEventListener('click', e => {
            if(e.target.className === 'fas fa-window-close'){
                const closeBtn = e.target;
                closeBtn.addEventListener('click', () => {
                    cartOverlay.classList.remove('transparentBcg');
                    cartDOM.classList.remove('showCart');
                });   
            }
        })*/
    }
        clearCart(){
            let cartItems = cart.map(item => item.id);
            cartItems.forEach(id => this.removeItem(id)); //remove from the cart
            while(cartContent.children.length>0){         //remove from DOM(화면)
                cartContent.removeChild(cartContent.children[0]) //=firstchild지워라. child없을때까지
            }
            this.hideCart();
        }
        removeItem(id){
            cart = cart.filter(item => item.id !== id)  // 받은 id를 가지고 있지 않은 아이템만 포함하도록 카트 업데이트
            this.setCartValues(cart); 
            Storage.saveCart(cart);   //getcart가 아니라 savecart
            let button = this.getSingleButton(id);
            button.disabled = false;
            button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`
        }
        getSingleButton(id){
            return buttonsDOM.find(button => button.dataset.id === id);  //버튼 배열에서 같은 id인걸 찾아라(3:07:00)
            
        }
}

//save to local storage (상품 갯수가 많지 않아서 이 방법 선택. 데이터 많으면 contentful을 통해서 하는게 나음 )
class Storage{
    //static method : 인스턴스 만들 필요 없고 클래스 자체로 바로 사용 가능. 이 클래스 밖에서 자주 써야하니까 이렇게 만든듯?
    static saveProducts(products){  
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProducts(id){     //ls에 있는 아이템들 중 버튼의 id를 인자로 해서 그 id인 제품만 (카트로) 가져오기
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)  //find:원배열유지. 조건만족하는 거 하나만 리턴
    }
    static saveCart(cart){  
        localStorage.setItem("cart", JSON.stringify(cart))  //새로운 cart를 받아서 저장
    }
    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
        //(로컬스토리지 카트에 물건이 담겨있을 때만) 카트 내용을 파싱해 가져오기
    }
}



//run Products class
document.addEventListener('DOMContentLoaded', () => {  
    const ui = new UI();    //UI의 인스턴스 만들기.클래스가 또 필요할 때 new를 통해 다시 사용 가능
    ui.setupAPP(); //=UI클래스의 setupapp 메소드를 실행시킴 set up app (before data loaded)
    
    const products = new Products();
    //get all products 
    products.getProducts()
        .then(products => {  //class Products에서 만든 getProducts라는 메소드로 데이터 가져와서
        ui.displayProducts(products);          //ui의 메소드 displayProducts를 실행
        Storage.saveProducts(products);        //Storage는 static메소드라서 이렇게 클래스 이름 바로 쓰면 됨
    }).then(() => {
        //동적으로 추가되는 부분에서 세팅해야할 변수들 세팅
        ui.getBagButtons();
        ui.cartLogic();
    }); 
})

//source code : https://github.com/john-smilga/js-comfy-house-furniture-store