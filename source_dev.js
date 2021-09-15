//추가내용 (강의들으면서 코딩한 걸 바탕으로 기능추가해봄)
//--모바일 버전 - 햄버거바 토글+ products는 scroll link
//--pc버전 - navbar scroll link추가
//--clearbtn 위치 옮기고 checkout 버튼 생성 w/ 비활 기능
//--아이템 remove 하고 새로고침 안하면 계속 incart로 되어있는 문제 - 선생님이 잘못한거였음. 해결
//--in cart일때는 버튼 hovereffect 없애고 포인터 auto로

const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "ac86e5gcwwpp",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "Hc3rrLfA6VBUHUp3VeMNn3khbaSvQQGczSYskGwyCEc"
});

// variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const checkoutBtn = document.querySelector('.checkout-btn');
let cart = [];

// products
class Products {
  async getProducts() {
    try {
      //let result = await fetch("products.json");
      //let data = await result.json();
       let contentful = await client.getEntries({
         content_type: "comfyHouseProducts"
       });
       //console.log(contentful)

      let products = contentful.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      console.log(products);

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// ui
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
   <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        <!-- end of single product -->
   `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach(button => {
      let id = button.dataset.id;

      let inCart = cart.find(item => item.id === id);
      if (inCart) {           //정확히 어떤 경우인지 이해?-새로고침했을 때 카트에 이미 담겨있는 경우
        button.innerText = "In Cart";
        button.disabled = true;
        button.classList.add('inCart-btn');
      } else {    //버튼 눌렀을 때
        button.addEventListener("click", event => {
          // disable button
          event.target.innerText = "In Cart";
          event.target.disabled = true;
          button.classList.add('inCart-btn');
          // add to cart
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          cart = [...cart, cartItem];
          Storage.saveCart(cart);
          // add to DOM
          this.setCartValues(cart);
          this.addCartItem(cartItem);
          this.showCart();
        });
      }
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<!-- cart item -->
            <!-- item image -->
            <img src=${item.image} alt="product" />
            <!-- item info -->
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <!-- item functionality -->
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">
                ${item.amount}
              </p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
          <!-- cart item -->
    `;
    cartContent.appendChild(div);
    clearCartBtn.classList.add('showBtn'); //물건을 넣었을 때 clear 버튼 보여주기
    checkoutBtn.classList.add('able-btn'); //물건을 넣었을 때 checkout 버튼 활성화
    checkoutBtn.disabled = false;
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cart = cart.filter(item => item.id !== id);
        console.log(cart);

        this.setCartValues(cart);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttons.forEach(button => {
          if (button.dataset.id === id) {
            console.log('d')
            button.disabled = false;
            button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
            button.classList.remove('inCart-btn');
          }
        });  
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cart = cart.filter(item => item.id !== id);
          this.setCartValues(cart);
          Storage.saveCart(cart);
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          const buttons = [...document.querySelectorAll(".bag-btn")];      
          buttons.forEach(button => {
            if (button.dataset.id === id) {   //parseInt 빼야제대로 작동함!
              button.disabled = false;
              button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
              button.classList.remove('inCart-btn');
            }
          });
        }
      } //모든 로직이 작동하고 난 후 남은 상품갯수가 0이면 
      if(cart.length===0){  
          clearCartBtn.classList.remove('showBtn')    //클리어버튼 없애기
          checkoutBtn.classList.remove('able-btn');   //checkout 버튼 비활성화
          checkoutBtn.disabled = true;
        }
    });
  }
  clearCart() {
    cart = [];
    this.setCartValues(cart);
    Storage.saveCart(cart);
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach(button => {
      button.disabled = false;
      button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
      button.classList.remove('inCart-btn');
    });
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
    clearCartBtn.classList.remove('showBtn')    // 클리어 버튼 누르면 버튼 없애기
    checkoutBtn.classList.remove('able-btn');   //checkout 버튼 비활성화
    checkoutBtn.disabled = true;
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setupAPP();

  // get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});

//스크롤 추가
const productsPage = document.getElementById('products').offsetTop
const navbarHeight = document.querySelector('.navbar').getBoundingClientRect().height;
document.addEventListener('click', e => {
  e.preventDefault();
  const link = e.target.getAttribute('href')  //getAttribute('href')로 가져오는 것!!
  if(link === '#products'){
    window.scrollTo({top: productsPage-navbarHeight, behavior:'smooth'})
  } else if(link === '#home') {
    window.scrollTo({top:0, behavior:'smooth'})
  } 
})

//메뉴 토글 추가
const toggleBtn = document.querySelector('.nav-icon');
const menu = document.querySelector('.menu');
toggleBtn.addEventListener('click', (e) => {
  /*if(!menu.classList.contains('showMenu')){
    menu.classList.add('showMenu')
  }*/
  menu.classList.toggle('showMenu')
})

//메뉴링크 클릭하면 닫히게
const menuLinks = document.querySelectorAll('.menu-link');
menuLinks.forEach((menulink) => {         //all로 고른 경우에는 forEach로 감싸줘야 작동함!!!★★★
  menulink.addEventListener('click', ()=>{
    menu.classList.remove('showMenu')
  })
})
//메뉴 바깥 클릭하면 메뉴 닫히게
const main = document.querySelector('.main'); //정석은 아니고 꾸역꾸역 찾은 방법,,결국 navbar제외한 영역을 모두 main div로 묶음
main.addEventListener('click', (e) => {
  if(menu.className ==='menu showMenu'  && e.currentTarget.className!=='menu-link'){
    menu.classList.remove('showMenu');
  } 
})

