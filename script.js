        //===================================================================================
        // 전역변수 초기화
        //===================================================================================
        let draggingMenu = null;
        let dragOverCart = null;
        let dragOverMenu = null;
        

        let orderTotalAmount = 0;
        let orderTotalPrice = 0;
        //===================================================================================
        // menu event start, end함수
        //===================================================================================
        function OnDragStartMenu(event) {             
            draggingMenu = this;
            this.classList.add("menuDrag");
            console.log("menu drag Start")
        }
        function OnDragEndMenu(event) {
            draggingMenu = null;
            this.classList.remove("menuDrag");
            console.log("menu를 drag End")
        }
        //===================================================================================
        // menu를 cart에 추가 event 함수
        //===================================================================================
        function OnDragOverMenu(event) {
            dragOverMenu = this;
        } 
        function OnDragLeaveMenu(event) {
            dragOverMenu = null;;
        }
        function OnDragOverCart(event) {
            event.preventDefault();
            dragOverCart = this;
        }
        function OnDragLeaveCart(event) {
            dragOverCart = null;
        }
        function OnDropCart(event) {
            event.preventDefault();
            if (draggingMenu) { 
                totalPrice(draggingMenu);
                this.appendChild(draggingMenu);
            }
        }
        function OnDropMenuList(event){
            event.preventDefault();
            if(draggingMenu){
                OrderZero(draggingMenu);
                this.appendChild(draggingMenu);
            }

        }
        function OnDropMenu(event) {
            event.stopPropagation();
            if (draggingMenu) {
                this.parentNode.insertBefore(draggingMenu, this);
            }
        }
        //=================================================================
        // 메뉴리스트로 돌아가면 수량, 금액 변경
        //=================================================================
        function OrderZero(menu){

            let ele_price = menu.querySelector(".price");
            let ele_total_price = menu.querySelector(".total_price");
            let ele_quantity = menu.querySelector(".quantity");

            let price = parseInt(ele_price.innerText.replace('원', ''));
            let quantity = parseInt(ele_quantity.innerText);

            orderTotalAmount -= quantity;
            orderTotalPrice -= price*quantity;
            
            console.log(`${price}`);
            ele_total_price.textContent = `${(price).toLocaleString('ko-KR')}원`;
            ele_quantity.textContent = `1`;
            updateOrder();
        }
        //==================================================================
        // 수량 변경 함수
        //==================================================================
        function totalPrice(menu){
            let plus = menu.querySelector(".plus");
            let minus = menu.querySelector(".minus");
            let ele_quantity = menu.querySelector(".quantity");
            let ele_price = menu.querySelector(".price");
            let ele_total = menu.querySelector(".total_price");

            let quantity = parseInt(ele_quantity.innerText);
            let price = parseInt(ele_price.innerText.replace('원', ''));
            
            orderTotalAmount += quantity;
            orderTotalPrice += price;
            updateOrder();

            ele_total.textContent = `${(price * quantity).toLocaleString('ko-KR')}원`;
            
            plus.onclick = function(){
                quantity++;
                ele_quantity.textContent = quantity;
                ele_total.textContent = `${(price * quantity).toLocaleString('ko-KR')}원`;

                orderTotalAmount++;
                orderTotalPrice += price;
                updateOrder();
                
            }
            minus.onclick = function(){
                if(quantity>1){
                    quantity--;
                    ele_quantity.textContent = quantity;
                    ele_total.textContent = `${(price * quantity).toLocaleString('ko-KR')}원`;
                    
                    orderTotalAmount--;
                    orderTotalPrice -= price;
                    updateOrder();
                }
                else{
                    ele_quantity.textContent = `1`;
                    ele_total.textContent = `${(price * quantity).toLocaleString('ko-KR')}원`;
                    alert("수량이 너무 적습니다.");
                }
            }
        }
        //==================================================================
        // 결제 함수
        //==================================================================
        function addCartToReceipt() {
            let receiptList = document.getElementById("receiptList");
            let cartItems = document.querySelectorAll("#cartContainer .menu");
        
            let result = confirm("결제 하시겠습니까?");
        
            if(result) {
                let saleDetails = []; // 판매 내역을 저장할 배열
                let totalItems = 0; // 총 수량
                let totalPrice = 0; // 총 가격
        
                // 영수증 초기화
                receiptList.innerHTML = ""; // 기존 영수증 내용 초기화
        
                for (let menu of cartItems) {
                    let menuName = menu.querySelector(".menuName").innerText;
                    let quantity = parseInt(menu.querySelector(".quantity").innerText);
                    let price = parseInt(menu.querySelector(".total_price").innerText.replace('원', '').replace(/,/g, ''));
        
                    // 판매 내역에 메뉴 정보 추가
                    saleDetails.push({ name: menuName, quantity: quantity, price: price });
                    totalItems += quantity;
                    totalPrice += price;
        
                    // 영수증에 추가
                    let listItem = document.createElement("li");
                    listItem.innerText = `${menuName} (${quantity}개) - ${price.toLocaleString('ko-KR')}원`;
                    receiptList.appendChild(listItem);
                }
        
                // 판매 기록 저장
                let saleRecord = {
                    date: new Date().toLocaleString(), // 현재 날짜와 시간
                    details: saleDetails,
                    totalItems: totalItems,
                    totalPrice: totalPrice
                };
        
                // 기존 판매 내역 가져오기
                let sales = JSON.parse(localStorage.getItem('sales')) || [];
                sales.push(saleRecord); // 새로운 판매 기록 추가
                localStorage.setItem('sales', JSON.stringify(sales)); // 판매 내역 저장
        
                // 영수증 정보 추가
                let totalItem = document.createElement("div");
                totalItem.innerHTML = `주문 수량 : ${totalItems}개 <br>주문 금액 : ${totalPrice.toLocaleString('ko-KR')}원`;
                receiptList.appendChild(totalItem);
        
                // 장바구니 초기화
                clearCart();
                displaySales(); // 판매 내역을 화면에 다시 표시
            } else {
                location.reload();
            }
        }
        //==================================================================
        // 장바구니, 판매내역
        //==================================================================
        // 장바구니 초기화 함수
        function clearCart() {
            let cartContainer = document.getElementById("cartContainer");
            cartContainer.innerHTML = ""; // 장바구니 내용 초기화
            orderTotalAmount = 0; // 총 수량 초기화
            orderTotalPrice = 0; // 총 가격 초기화
            updateOrder(); // 주문 정보 업데이트
        }

        // 판매내역
        function displaySales() {
            let saleList = document.getElementById("saleList");
            saleList.innerHTML = ""; // 기존 판매 내역 초기화

            // localStorage에서 판매 내역 가져오기
            let sales = JSON.parse(localStorage.getItem('sales')) || [];

            // 판매 내역을 화면에 표시
            for (let sale of sales) {
                let saleItem = document.createElement("li");
                saleItem.innerHTML = `판매 시간: <strong>${sale.date}</strong> <br>총 개수: ${sale.totalItems}개 - 총 가격: ${sale.totalPrice.toLocaleString('ko-KR')}원<br><br>`;
                
                // 메뉴 내역 추가
                for (let detail of sale.details) { saleItem.innerHTML += `${detail.name} (${detail.quantity}개) - ${detail.price.toLocaleString('ko-KR')}원<br>`; }

                saleList.appendChild(saleItem);
            }
        }

        //==================================================================
        // 업데이트 함수
        //==================================================================
        function updateOrder(){
            document.querySelector(".orderTotalAmount").textContent = orderTotalAmount;
            document.querySelector(".orderTotalPrice").textContent = `${orderTotalPrice.toLocaleString('ko-KR')}원`;
        }



        
        //===================================================================================
        // Event Listener
        //===================================================================================
        $(document).ready(function() {
            let menus = JSON.parse(localStorage.getItem('menus')) || [];
            for (let menu of menus) {
                add(menu);
            }
            //===================================================================================
            // Menu Event Listener
            //===================================================================================
            let menuArray = document.getElementsByClassName("menu");
            for (let menu of menuArray) {
                menu.addEventListener("dragstart", OnDragStartMenu);
                menu.addEventListener("dragend", OnDragEndMenu);
                menu.addEventListener("dragover", OnDragOverMenu);
                menu.addEventListener("dragleave", OnDragLeaveMenu);
                menu.addEventListener("drop", OnDropMenu);
            }

            let menuCArray = document.getElementsByClassName("menuC");
            for(let menuC of menuCArray){
                menuC.addEventListener("dragover", OnDragOverCart);
                menuC.addEventListener("dragleave", OnDragLeaveCart);
                menuC.addEventListener("drop", OnDropMenuList);

            }
            //===================================================================================
            // Cart Event Listener
            //===================================================================================
            let cartArray = document.getElementsByClassName("cartC");
            
            for(let cart of cartArray){
                cart.addEventListener("dragover", OnDragOverCart);
                cart.addEventListener("dragleave", OnDragLeaveCart);
                cart.addEventListener("drop", OnDropCart);
            }
            //===================================================================================
            // 영수증
            //===================================================================================

            $("#order").click(function(){
                addCartToReceipt();
                $("#receipt").fadeToggle(1000);
                setTimeout(function(){
                    location.reload()}, 10000);
            })

            //===================================================================================
            // 관리자 페이지
            //===================================================================================
            $('#mngbtn').click(function(){
                let result = prompt("비밀번호를 입력하시오.");
                
                if(result === 'sheep'){ // 알맞은 비밀번호 입력 시 관리자 패이지 표시
                    $("#manager").show();
                    $("#screen").hide();
                }
                else{                   // 잘못 입력 시 "잘못 입력 하였습니다. 경고 메시지 출력"
                    alert("비밀번호를 잘못 입력 하였습니다.");
                }
            })
            $('#backMenu').click(function(){    // 돌아가기 버튼 클릭 시 초기화면으로 이동
                $("#manager").hide();
                $("#screen").show();
            })

            $('#addMenu').click(function(){
                let menuName = prompt("메뉴 이름을 입력 해주세요.");
                let menuList = document.getElementById('menuList');
            
                if(menuName !== null){
                    let menuImgPath = prompt("메뉴 이미지 경로를 입력 해주세요.");
                    if(menuImgPath !== null){
                        let menuPrice = prompt("메뉴 가격을 입력 해주세요.");
                        if(menuPrice !== null){
                            // 메뉴 객체 생성
                            let newMenu = {
                                name: menuName,
                                imgPath: menuImgPath,
                                price: menuPrice
                            };
            
                            let menus = JSON.parse(localStorage.getItem('menus')) || [];
                            menus.push(newMenu); // 새로운 메뉴 추가
                            localStorage.setItem('menus', JSON.stringify(menus));

                            add(newMenu);
                        }
                        else{
                            alert("잘못 입력 하셨습니다.");
                        }
                    }
                    else{
                        alert("잘못 입력 하셨습니다.");
                    }
                }
                else{
                    alert("잘못 입력 하셨습니다.");
                }
            });
            
            //메뉴 추가
            function add(menu) {
                let menuList = document.getElementById('menuList');
                let menuElement = document.createElement("div");
                menuElement.className = "menu";
                menuElement.draggable = true;
                menuElement.innerHTML = `<img width="100vw" src="${menu.imgPath}">
                                         <span class="menuName">${menu.name}</span>
                                         <span class="price">${menu.price}원</span>
                                         <div class="btn">
                                             <button class="plus">+</button>
                                             <span class="quantity">1</span>
                                             <button class="minus">-</button>
                                             <br>
                                             <span class="total_price">-</span>
                                         </div>`;
                
                menuList.appendChild(menuElement);
            
                menuElement.addEventListener("dragstart", OnDragStartMenu);
                menuElement.addEventListener("dragend", OnDragEndMenu);
                menuElement.addEventListener("dragover", OnDragOverMenu);
                menuElement.addEventListener("dragleave", OnDragLeaveMenu);
                menuElement.addEventListener("drop", OnDropMenu);
            }

            // 메뉴 삭제 기능
            $('#removeMenu').click(function(){
                let menuName = prompt("메뉴 이름을 입력해주세요.");
            
                if(menuName !== null){
                    let menus = JSON.parse(localStorage.getItem('menus')) || [];
                    let updatedMenus = menus.filter(menu => menu.name !== menuName);
            
                    if (menus.length !== updatedMenus.length) {
                        localStorage.setItem('menus', JSON.stringify(updatedMenus));
                        alert(`${menuName} 메뉴가 삭제되었습니다.`);
                        location.reload();
                    } else {
                        alert(`${menuName} 메뉴를 찾을 수 없습니다.`);
                    }
                }
                else{
                    alert("잘못 입력 하셨습니다.");
                }
            });

            //판매 내역 초기화
            $('#saleReset').click(function() {
                if (confirm("판매 내역을 초기화 하시겠습니까?")) {
                    localStorage.removeItem('sales');
                    displaySales();
                    alert("판매 내역이 초기화되었습니다.");
                }
            });
            
            $('#sale').click(function() {
                $('#saleList').slideToggle(300);
            });

            //페이지 로드 시 판매내역 출력
            displaySales();
        });
        //===================================================================================
