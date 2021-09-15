//혼자 만들어보기 1단계
//제품 데이터 가져오는 부분. class 아직 없음

const productsWrap = document.querySelector('.products-center')
let allProducts = [];  //이거 있어도 되는데 강의에서는 처음에 데이터 가져오고 바로 ls에 저장해주는 흐름이기 때문에 안쓴듯

const fetchData = async() => {
  try{
    const response = await fetch('products.json');
    const rawdata = await response.json();
    let data = rawdata.items
    data = data.map((data) => {   //data 에 전체를 담기(새로운변수에 담아도됨)
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

function displayProducts(products) {
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
  productsWrap.innerHTML = result; //위에서 allProduct에 누적해 담고, 여기서 allProduct를 innerHTML로 넣어도 됨
}


document.addEventListener('DOMContentLoaded', () => {
  fetchData()
  .then(product => displayProducts(product))  //then 연결해서 처리해야만함
})  