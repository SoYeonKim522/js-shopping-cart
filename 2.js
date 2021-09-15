//혼자 만들어보기 2단계


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


class ProductsData {  
  async fetchData() {
    try{
      const response = await fetch('products.json');
      const rawdata = await response.json();
      let data = rawdata.items
      data = data.map((data) => {   //data 에 전체를 담기
        const { id } = data.sys;
        const { title, price } = data.fields;
        const img = data.fields.image.fields.file.url;
        return { id, title, price, img }  
      });
      return data;      //그리고 data를 리턴. 이걸 안하면 안됨ㅠㅠ
    } catch(error){
      console.log(error)
    }
  }
}


class UI{
  displayProducts(products) {
    let result = '';
    products.map((item) => {
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

  
  toCartBtn(){
    const bagBtns = [...document.querySelectorAll('.bag-btn')];
    btnDOM = bagBtns;
    //queryselectorall 에 이벤트추가하는 법 구글링 : forEach  이용
    bagBtns.forEach(btn => {
      let id = btn.dataset.id  //id는 여기 밖에

      let inCart = cart.find(item => item.id === id)
      if(inCart){
        btn.innerText = 'In Cart'
        btn.disabled = true;
      } else {
        // btn.innerText = 'Add to Cart'
        // btn.disabled = false;

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
          //this.cartLogic(id) //여기서 아직 실행X
        })
      }
    })
  }

  addToCart(item){
    const div = document.createElement('div')
    div.classList.add('cart-item');
    //item.map((item) => {  //맵핑 필요없음!!!
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
  //카트에 담긴 아이템 총갯수 + 총가격 구하기 - 카트 안에서 갯수 변경했을 때 반영안됨
  getCartValue(cart){
    let tempPrice = 0;  //먼저 변수 만들고 초기값을 정의하는 방식에 익숙해지기!!!!!
    let tempAmount = 0;
    cart.map((item) => {
      tempPrice += item.price * item.amount; //map안에 있는 +=니까 reduce없이도 합 구할수있음
      tempAmount += item.amount
    })
    totalPrice.innerText = tempPrice
    inCartAmount.innerText = tempAmount
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
  
  // updateBagBtn(){
  //   const bagBtns = [...document.querySelectorAll('.bag-btn')];
  //   const id = bagBtns.map(btn => btn.id) //1~8
    
  //   bagBtns.forEach(btn => {
  //     const t= cart.find(item => item.id !== btn.dataset.id)
  //     console.log(t)
  //       t.innerText = 'Add to Cart';
  //       t.disabled = false;
  //   })
  // }  //버튼 id중 cart 아이템의 id와 다른 애들만 

  cartLogic(){   //인자 없음. DOMload되고 실행되는 메소드임
    //카트열고닫기
    cartBtn.addEventListener('click', this.showCart) // 이거 위치? 카트 비었을 때도 열리도록
    closeCartBtn.addEventListener('click', ()=> {
      cartPage.classList.remove('showCart')
      cartOverlay.classList.remove('transparentBcg')
    })

    clearBtn.addEventListener('click', (e) => {
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
      clearBtn.classList.remove('showBtn')
      this.getCartValue()
    })
    
    cartWrap.addEventListener('click', (e) => {
      //if(e.target.className === 'fas fa-window-close') //카트 닫는 동작 여기에 말고 독립적으로. 항상 작동해야 하는 동작이니까
      if(e.target.className === 'remove-item'){ 
        const id = e.target.dataset.id
        cart = cart.filter(item => item.id !== id) //이렇게만 하면 안되는 이유★★★: cart배열과 cart DOM이 따로 작동함. 이렇게만 하면 cart배열만 업데이트됨.. js에서는 이게 불가능한가?? 리액트랑 내가 헷갈리는 건가??
        const removeItem = e.target.parentElement.parentElement
        cartWrap.removeChild(removeItem)
          //id가 해당하는 cart-item div를 찾아서 지우려고 시도했는데 안됨
          // const cartItem = [...document.querySelectorAll('.cart-item')]
          // console.log(cartItem)
          // const removeItem = cartItem.forEach(item => {
            //   item.find(item => item.lastChild.firstChild.id === id) //find가 안된다함
            // })
            // cartWrap.removeChild(removeItem)
          Storage.saveCart(cart)
          this.getCartValue(cart)
          // const currCart = [Storage.getCart()] //처음엔 ls에서 데이터를 가져와서 가공하려고 함
          // cart = currCart.filter(item => (item.id !== id))

          //add to cart 버튼으로 되돌리기 _선택한 버튼을 바로 선택해서 작업 + 전역변수 btnDOM 이용
          let btn = btnDOM.find(btn => btn.dataset.id === id)
          btn.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`
          btn.disabled = false;

          //이건 btnDOM 사용안하고 하는 법인데 작동안됨..
          // const bagBtn = [...document.querySelectorAll('.bag-btn')];
          // bagBtn.forEach(btn => {
          //   if (parseInt(btn.dataset.id) === id){
          //     btn.innerText = 'Add to Cart'
          //     btn.disabled = false
          //   }
          // })

          // 카트에 포함되어있지 않은 아이템들의 버튼을 골라서 작업하려고 시도
          // const notInCart = bagBtn.filter(item => cart.id !== item.id)
          // notInCart.innerText = 'Add to Cart'
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
        if(chosen.amount < 1){
          const removeItem = e.target.parentElement.parentElement
          cartWrap.removeChild(removeItem)
          this.removeItem(id)
        }
        Storage.saveCart(cart)
        this.getCartValue(cart)
      }

    })

    
  }
  removeItem(id){
    cart = cart.filter(item => item.id !== id)
    let btn = btnDOM.find(btn => btn.dataset.id === id)
    btn.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`
    btn.disabled = false
    // Storage.saveCart(cart)  //일단 없어도 작동함
    // this.getCartValue(cart) 
  }
  

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
    JSON.parse(localStorage.getItem('MyCart'))
    //return cart.find(item => item.id === id)
  }

}


document.addEventListener('DOMContentLoaded', () => {
  const products = new ProductsData;  //const 써야함
  const ui = new UI;

  products
  .fetchData()
  .then(product => {  //이 경우 fetch한 같은 결과로 두 가지 함수를 실행해야. then을 또 쓰면 다른결과(undefined)
    ui.displayProducts(product)
    Storage.saveProducts(product)
  })                  //중괄호로 묶어서 여러개 같이 실행 가능
  .then(() => {
    ui.toCartBtn()
    ui.cartLogic()  //invoke를 뺐더니 cartlogic이 한클릭에 두번씩 작동하지 않음.근데 카트 비어있는 상태에서는 카트가 안열림 -- 여기는 invoke하고 toCart에서 지워야
  })
})  
