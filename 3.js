//혼자 만들어보기  - 리팩토링(?) 전

const productsWrap = document.querySelector('.products-center');
const cartWrap = document.querySelector('.cart-content');
const cartOverlay = document.querySelector('.cart-overlay');
const cartPage = document.querySelector('.cart');
const closeCartBtn = document.querySelector('.close-cart');
const cartBtn = document.querySelector('.cart-btn');
const inCartAmount = document.querySelector('.cart-items');
const totalPrice = document.querySelector('.cart-total');
const clearBtn = document.querySelector('.clear-cart')

let btnDOM = []
let cart = []


let arr = [1, 2, 3, 4, 5];
let newarr = []
 const a = arr.forEach((a,i) => {
  newarr += a*2})

//console.log(a)  //--never works. doesn't return anything even with 'return'
console.log(arr) //2,4...
console.log(newarr)


let array = [1, 2, 3, 4, 5];
let newarray  = []
const b = array.map(a => newarray += a*2)
console.log(b) //이렇게 바로 새로운 배열 반환함. 원배열 유지
console.log(newarray)


class ProductsData {  
  async fetchData() {
    try{
      const response = await fetch('products.json');
      const rawdata = await response.json();
      let data = rawdata.items //data의 타입은 object라고 나옴 
      console.log(typeof data)
      data = data.map((data) => {   //data 에 전체를 담기
        const { id } = data.sys;
        const { title, price } = data.fields;
        const img = data.fields.image.fields.file.url;
        return { id, title, price, img }  
      });
      console.log(typeof data) 
      return data;      //그리고 data를 리턴. 이걸 안하면 안됨ㅠㅠ, data의 타입은 object라고 나옴 
    } catch(error){
      console.log(error)
    }
  }
}


class UI{
  displayProducts(products) {
    let result = ''; //string으로 초기값 정의 -> +=로 단순히 더해주면 그냥 string으로 쭉 더해짐. innerHTML로 쓸꺼니까 
    products.forEach((item) => {  //확인결과 map으로 해도 result는 똑같이 나옴 -여기서는 다른 변수에 넣어주는 거라 그런듯?
      result +=  `<article class="product">
      <div class="img-container">     
      <img src=${item.img} alt="product" class='product-img'>
      <button class="bag-btn" data-id=${item.id}>
      <i class="fas fa-shopping-cart"></i> add to bag
      </button>
      </div>
      <h3>${item.title}</h3>
      <h4>$${item.price}</h4>
      </article>` 
    })
    productsWrap.innerHTML = result;
  }

  
  toCartBtn(){  //원래코드에서 getBagButtons 와 같은기능
    const bagBtns = [...document.querySelectorAll('.bag-btn')];
    btnDOM = bagBtns;
    //queryselectorall 에 이벤트추가하는 법 구글링 : forEach  이용
    bagBtns.forEach(btn => {   //nodelist이기 때문에 map 같은건 못씀
      let id = btn.dataset.id  //id는 if 밖에

      let inCart = cart.find(item => item.id === id)
      if(inCart){
        btn.innerText = 'In Cart'
        btn.disabled = true;
      } else {
        btn.innerText = 'Add to Cartt'
        btn.disabled = false;

        btn.addEventListener('click', (e) => {
          e.target.innerText = 'In Cart'
          e.target.disabled = true;
          //ㄴconst id = parseInt(e.target.dataset.id);  const chosenBtn = bagBtn.find(item => id === item.id)  //e로 하면 되기 때문에 id필요없음
          const newItem = {...Storage.getTheProducts(id), amount: 1}
          cart = [...cart, newItem]
          Storage.saveCart(cart)
          this.addToCart(newItem)   //this!
          this.getCartValue(cart)
          this.showCart();
          //this.cartLogic(id) //여기서 실행X -- 하면 amount가 2개씩 올라가는 등 오류.. 근데 근본적 이유????
        })
      }
    })
  }

  addToCart(item){
    const div = document.createElement('div')
    div.classList.add('cart-item');
    //item.map((item) => {  //맵핑 필요없음!!!  하나씩 카트에 추가하니까(?)
      div.innerHTML = ` <img src=${item.img} alt="product">
                    <div>
                      <h4>${item.title}</h4>
                      <h5>$${item.price}</h5>
                      <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                      <i class="fas fa-chevron-up" data-id=${item.id}></i>
                      <p class="item-amount">${item.amount}</p>
                      <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>`
    //})
    cartWrap.appendChild(div)  //div이 아니라 원래 있는 cartWrap에 appendchild해야!!!
  }

  showCart(){
    cartOverlay.classList.add('transparentBcg')
    cartPage.classList.add('showCart')
  }
  hideCart(){
    cartPage.classList.remove('showCart')
    cartOverlay.classList.remove('transparentBcg')
  }
  //카트에 담긴 아이템 총갯수 + 총가격 구하기 - 카트 안에서 갯수 변경했을 때 반영안됨--해결
  getCartValue(cart){
    let tempPrice = 0;  //먼저 변수 만들고 초기값을 정의하는 방식에 익숙해지기!!!!!
    let tempAmount = 0;
    cart.map((item) => {
      tempPrice += item.price * item.amount; //map안에 있는 +=니까 reduce없이도 합 구할수있음
      tempAmount += item.amount
    })
    totalPrice.innerText = tempPrice
    inCartAmount.innerText = tempAmount

    if(cart.length>0){
      clearBtn.classList.add('showBtn')
    }  clearBtn.classList.remove('showBtn')
    
  }
        // getCartValue(cart){  //이것도 맞는데 위가 더 간단한 코드임
        //   let price = cart.map((item) => item.price * item.amount)
        //   const resultprice = price.reduce((sum, cur)=> {
        //      return sum + cur
        //    },0)
        //   let amount = cart.map((item) => item.amount)
        //   const resultamount = amount.reduce((sum, cur)=> {
        //      return sum + cur
        //    },0)
        //   totalPrice.innerText = resultprice
        //   inCartAmount.innerText = resultamount
        // }
  
  // updateBagBtn(){  ---tocartbtn 대신 bagbtn 업데이트해주는 메소드 따로 만들려고시도
  //   const bagBtns = [...document.querySelectorAll('.bag-btn')];
  //   const id = bagBtns.map(btn => btn.id) //1~8
    
  //   bagBtns.forEach(btn => {
  //     const incart = cart.find(item => item.id !== btn.dataset.id)
  //     if(!incart){
  //       btn.innerText = 'Add to Cartt';
  //       btn.disabled = false;
  //      }  btn.innerText = 'In Cartt';
  //        btn.disabled = true;
  //   })
  // }  //버튼 id중 cart 아이템의 id와 다른 애들만 

  cartLogic(){   //인자 없음. DOMload되고 실행되는 메소드임
    //카트열고닫기 - 이거 위치??? 카트 비었을 때도 열리도록 -- 소스코드에서는 setup에 넣었고 그게 맞는것 같은데 여기에 놔둬도 작동은 함
    cartBtn.addEventListener('click', this.showCart) 
    closeCartBtn.addEventListener('click', this.hideCart)

    clearBtn.addEventListener('click', () => {
      cart=[];         //cart 배열 업데이트
      while(cartWrap.hasChildNodes()){  //cart DOM 업데이트는 따로 
        cartWrap.removeChild(cartWrap.firstChild)  //_googling
      }
      const bagBtns = [...document.querySelectorAll('.bag-btn')];
      bagBtns.forEach(btn => {
      btn.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
      btn.disabled = false;
      })
      Storage.saveCart(cart)
      this.getCartValue(cart)
      //////clearBtn.classList.remove('showBtn')
      setTimeout(() => {
        this.hideCart()
      }, 500);
    })
    
    
    cartWrap.addEventListener('click', (e) => {
      //if(e.target.className === 'fas fa-window-close') //카트 닫는 동작 여기에 이벤트로 말고 독립적으로. 항상 작동해야 하는 동작이니까
      if(e.target.className === 'remove-item'){ 
        const id = e.target.dataset.id
        this.removeItem(id)
        cartWrap.removeChild(e.target.parentElement.parentElement)
      }
      if(e.target.className === 'fas fa-chevron-up'){
        const id = e.target.dataset.id
        const chosen = cart.find(item => item.id === id)
        chosen.amount += 1;
        e.target.nextElementSibling.innerText = chosen.amount;
        Storage.saveCart(cart)
        this.getCartValue(cart)
      }
      if(e.target.className === 'fas fa-chevron-down'){
        const id = e.target.dataset.id
        const chosen = cart.find(item => item.id === id)
        chosen.amount -= 1;
        e.target.previousElementSibling.innerText = chosen.amount;
        Storage.saveCart(cart)
        this.getCartValue(cart)
        if(chosen.amount < 1){
          cartWrap.removeChild(e.target.parentElement.parentElement)
          this.removeItem(id)
        }
      }
    })

    
  }
  removeItem(id){
    cart = cart.filter(item => item.id !== id)
    //add to cart 버튼으로 되돌리기 _선택한 버튼을 바로 선택해서 작업 + 전역변수 btnDOM 이용
    let btn = btnDOM.find(btn => btn.dataset.id === id)
    btn.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`
    btn.disabled = false
    Storage.saveCart(cart)  
    this.getCartValue(cart)  
  }
  
  setup(){  //인자 주는게 아니라 
    cart = Storage.getCart()  //const cart = Storage.getCart() (x)
    //this.cartSetup(cart)  //이거 대신 아래줄 한줄로 대체
    cart.forEach(item => this.addToCart(item))
    this.getCartValue(cart)
    //this.toCartBtn()  // no need here
  }
  // cartSetup(cart){
  //   cart.forEach(item => this.addToCart(item))  //this.addToCart(cart) 
  // }

}

class Storage{
  static saveProducts(products){
    localStorage.setItem('MyProducts', JSON.stringify(products))
  }
  static getTheProducts(id){
    let products = JSON.parse(localStorage.getItem('MyProducts'))
    return products.find(item => item.id === id) //이렇게 바로 조건에 맞는 데이터 찾아뱉을수있게,,
  }
  static saveCart(cart){
    localStorage.setItem('MyCart', JSON.stringify(cart))
  }
  static getCart(){
    return localStorage.getItem('MyCart') ? 
    JSON.parse(localStorage.getItem('MyCart')) : [] //mycart비어있을 때 고려 안해주면 처음로딩시 카트 셋업할때 오류남
    //JSON.parse(localStorage.getItem('MyCart')) (x)
    
  }

}


document.addEventListener('DOMContentLoaded', () => {
  const products = new ProductsData;  //const 써야함
  const ui = new UI;
  ui.setup()  //인자 없이

  products
  .fetchData()
  .then(product => {  //이 경우 fetch한 같은 결과로 두 가지 함수를 실행해야. then을 또 쓰면 다른결과(undefined)
    ui.displayProducts(product)
    Storage.saveProducts(product)
  })                  //중괄호로 묶어서 여러개 같이 실행 가능
  .then(() => {
    ui.toCartBtn()
    ui.cartLogic()  //invoke를 뺐더니 cartlogic이 한클릭에 두번씩 작동하지 않음.근데 카트 비어있는 상태에서는 카트가 안열림 -- 여기는 invoke하고 toCartBtn에서 cartLogic 실행을 지워야
  })
})  
