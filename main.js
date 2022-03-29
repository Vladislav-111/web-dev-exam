
// Получение данных с сервера
function Loader(page = 1, filter = '') {
    let url_add = "http://exam-2022-1-api.std-900.ist.mospolytech.ru/api/restaurants";
    let api_key = "d2b3f0fa-8020-4342-a22c-50f9d65e072c";
    let url = new URL(url_add);
    url.searchParams.append("api_key", api_key);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        GiveCompanyL(this.response, page, filter);
        Givefiltres('', this.response);
    }
    xhr.send();
}
// Получение списка компаний
function GiveCompanyL(array, page, filter = '') {
    let spisokComp = document.querySelector('.company-list');
    spisokComp.innerHTML = '';
    let count = 0, start, end;
    let restorant = [];

    if (filter['isFilter']) {
        for (let elem of array) {
            if ((filter['admArea'] ? filter['admArea'] == elem['admArea'] : 1) &&
                (filter['district'] ? filter['district'] == elem['district'] : 1) &&
                (filter['typeObject'] ? filter['typeObject'] == elem['typeObject'] : 1)) {
                restorant.push(elem);
                count++;
            }
        }
    } else {
        for (let elem of array) {
            count++;
            restorant.push(elem);
        }
    }

    RatingSort(restorant, 'rate');
    console.log(restorant);

    let max_page = Math.ceil(count / 10);
    start = page * 10 - 10;
    (page < max_page) ? end = page * 10 : end = count;
    for (let i = start; i < end; ++i) {
        spisokComp.append(СreateCompElem(restorant[i]));
    }
    for (let btn of document.querySelectorAll('.chooseBtn')) {
        btn.onclick = ChoosedCompany;
    }
    PaginationList(page, max_page);
}

// Создание элемента компании
function СreateCompElem(company) {
    let item = document.getElementById('companyItem-template').cloneNode(true);
    item.querySelector('.company-name').innerHTML = company.name;
    item.querySelector('.company-type').innerHTML = company['typeObject'];
    item.querySelector('.company-address').innerHTML = company['address'];
    item.querySelector('.company-admArea').innerHTML = company['admArea'];
    item.querySelector('.company-district').innerHTML = company['district'];
    item.querySelector('.company-discount').innerHTML = company['socialDiscount'];
    item.setAttribute('id', company['id']);
    item.classList.remove('d-none');
    return item;
}


// Выбор компании по кнопке
function ChoosedCompany(event) {
    let id = event.target.closest('.list-group-item').id;

    let url_add = "http://exam-2022-1-api.std-900.ist.mospolytech.ru/api/restaurants/" + id;
    let api_key = "d2b3f0fa-8020-4342-a22c-50f9d65e072c";

    let url = new URL(url_add);
    url.searchParams.append("api_key", api_key);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        MenuRestoran(this.response);
        GiveInfoToModal(this.response);
    }
    xhr.send();
}

// Информация о подарочном сете
function OnGiftBtn(target) {
    let cont = document.querySelector('.modal-menu-info');
    document.querySelector('.modal-option-4').innerHTML = 'Да';
}
// Информация о бесконтактной доставке
function NonContact(target) {
    let cont = document.querySelector('.modal-menu-info');
    document.querySelector('.modal-option-3').innerHTML = 'Да';
}

// Фильтрация
function FilterTake(page = 1) {
    let form = document.querySelector('form');
    let filtr = {
        'admArea': form.elements['OkrugInp'].value,
        'district': form.elements['AreaInp'].value,
        'typeObject': form.elements['TypeInp'].value,
        'discount': form.elements['RebateInp'].value
    };
    if (filtr['admArea'] == '' && filtr['district'] == '' && filtr['typeObject'] == '') filtr['isFilter'] = false;
    else filtr['isFilter'] = true;

    Loader(page, filtr);
}

// Создание элемента пагинации страниц
function PaginationList(page, max_page) {
    let item = document.querySelector('.page-item').cloneNode(true);
    let StrPagin = document.querySelector('.pagination');
    StrPagin.innerHTML = '';

    item.querySelector('.page-link').innerHTML = "Пред";
    item.classList.remove('d-none');
    StrPagin.append(item);

    for (let i = page - 2; i < page + 3; ++i) {
        if (i > 0 && i < max_page + 1) {
            item = item.cloneNode(true);
            item.classList.remove('active');
            item.querySelector('.page-link').innerHTML = i;
            item.classList.remove('d-none');
            if (i == page) item.classList.add('active');
            StrPagin.append(item);
        }
    }

    item = item.cloneNode(true);
    item.querySelector('.page-link').innerHTML = "След";
    item.classList.remove('active');
    item.classList.remove('d-none');
    StrPagin.append(item);
}

// Пагинация страниц
function pagination(event) {
    let currentPage = Number(document.querySelector(".pagination").querySelector(".active").querySelector(".page-link").innerHTML);
    let NewPagin = event.target.innerHTML;

    if (NewPagin == 'Пред' && currentPage != 1) FilterTake(currentPage - 1);
    else if (NewPagin == 'След') FilterTake(currentPage + 1);
    // else if (NewPagin == currentPage) { }
    else FilterTake(Number(NewPagin));
}

// Сортировка объектов
function RatingSort(array, key) {
    let banner = true, tmp;
    while (banner) {
        banner = false;
        for (let i = 1; i < array.length; ++i) {
            if (array[i - 1][key] < array[i][key]) {
                banner = true;
                tmp = array[i - 1];
                array[i - 1] = array[i];
                array[i] = tmp;
            }
        }
    }
}

let zone = [], category = [];

// Фильтры по поиску ресторанов
function Givefiltres(event, array = '') {
    let filterbox = document.querySelector(".filters");
    let admArea, district, districts, type;
    if (array) {
        for (let element of array) {
            admArea = element["admArea"];
            district = element["district"];
            type = element["typeObject"];
            districts = new Array();

            if (category.indexOf(type) == -1) {
                category.push(type);
            }

            if (!FindElem(zone, admArea, 'admArea')) {
                zone.push({ "admArea": admArea, "district": districts });
            }
            if (!FindElem(zone, district, 'district')) {
                for (let item of zone) {
                    if (item['admArea'] == admArea) {
                        item['district'].push(district);
                    }
                }
            }
        }
    }

    let okrugFilter = filterbox.querySelector('#OkrugInp');
    let districtFilter = filterbox.querySelector('#AreaInp');

    if (event == 'district') {
        let int;
        for (let elem of zone) {
            for (let item of elem['district']) {
                if (item == districtFilter.value) {
                    int = elem['admArea'];
                }
            }
        }
        okrugFilter.value = int;
    }
    if (event == 'admArea') {
        districtFilter.innerHTML = '';
        districtFilter.append(document.createElement('option'));
        for (let elem of zone) {
            if (okrugFilter.value == elem['admArea']) {
                for (let item of elem['district']) {
                    let option = document.createElement('option');
                    option.innerHTML = item;
                    districtFilter.append(option);
                }
            }
        }
    }
    if (!okrugFilter.value && !districtFilter.value) {
        okrugFilter.innerHTML = '';
        okrugFilter.append(document.createElement('option'));
        districtFilter.innerHTML = '';
        districtFilter.append(document.createElement('option'));

        for (let elem of zone) {
            let option = document.createElement('option');
            option.innerHTML = elem['admArea'];
            okrugFilter.append(option);
        }
        for (let elem of zone) {
            for (let item of elem['district']) {
                let option = document.createElement('option');
                option.innerHTML = item;
                districtFilter.append(option);
            }
        }
    }

    let typeFilter = filterbox.querySelector('#TypeInp');

    if (!typeFilter.value) {
        typeFilter.innerHTML = '';
        typeFilter.append(document.createElement('option'));

        for (let elem of category) {
            let option = document.createElement('option');
            option.innerHTML = elem;
            typeFilter.append(option);
        }
    }

    let rebateFilter = filterbox.querySelector('#RebateInp');
    rebateFilter.innerHTML = '';
    rebateFilter.append(document.createElement('option'));

    let option = document.createElement('option');
    option.innerHTML = 'Да';
    rebateFilter.append(option);

    option = document.createElement('option');
    option.innerHTML = 'Нет';
    rebateFilter.append(option);
}

// Поиск элемента по фильтру
function FindElem(zone, elem, key) {
    if (key == 'admArea') {
        for (let element of zone) {
            if (element['admArea'] == elem) return true;
        }
    } else if (key == 'district') {
        for (let element of zone) {
            for (let item of element['district']) {
                if (item == elem) return true;
            }
        }
    }
    return false;
}

// Информация о компании в модальном окне
function GiveInfoToModal(element) {
    let ModElem = document.querySelector('.modal');
    ModElem.querySelector('.modal-company-name').innerHTML = element['name'];
    ModElem.querySelector('.modal-company-admArea').innerHTML = element['admArea'];
    ModElem.querySelector('.modal-company-district').innerHTML = element['district'];
    ModElem.querySelector('.modal-company-address').innerHTML = element['address'];
    ModElem.querySelector('.modal-company-rate').innerHTML = (Number(element['rate']) / 20).toString();

    let modalMenu = ModElem.querySelector('.modal-menu-info');
    modalMenu.innerHTML = '';
    for (let i = 1; i <= 10; ++i) {
        let name = 'set_' + i;
        modalMenu.append(ModMenElem(element[name], menu[i - 1]));
    }
}
// Информация об элементе меню в модальном окне
function ModMenElem(price, elem) {
    let item = document.querySelector('#modalMenuElem-template').cloneNode(true);
    item.querySelector('.modal-menu-name').innerHTML = elem['name'];
    item.querySelector('.modal-menu-img').setAttribute('src', elem['image']);
    item.querySelector('.modal-menu-price').innerHTML = price;
    return item;
}

// Управление меню ресторана
function MenuRestoran(element) {
    let menuContainer = document.querySelector('.menu-container');
    if (menuContainer.innerHTML) {
        console.log(true);
        let nonContact = document.querySelector('#option-3');
        if (nonContact.checked) {
            nonContact.checked = false;
            NonContact(nonContact);
        }
        document.querySelector('#option-4').checked = false;
    }
    menuContainer.innerHTML = '';
    document.querySelector('#menu').classList.remove("d-none");
    document.querySelector('#total').classList.remove("d-none");
    document.querySelector('.totalPrice').innerHTML = 0;
    document.querySelector('.modal-total-price').innerHTML = 0;


    for (let i = 1; i <= 10; ++i) {
        let name = 'set_' + i;
        menuContainer.append(MenuPosition(element[name], menu[i - 1]));
    }
    for (let btn of document.querySelectorAll('.input-group')) {
        btn.onclick = function (event) {
            let name = event.target.closest('.menu-item').querySelector('.menu-name').innerHTML;
            let modalMenuInfo = document.querySelector('.modal-menu-info');
            let menuItem = ModalMenuItem(modalMenuInfo, name);

            if (event.target.innerHTML == '+') {
                btn.querySelector('.menu-input').value = Number(btn.querySelector('.menu-input').value) + 1;
            } else if (event.target.innerHTML == '-' && btn.querySelector('.menu-input').value != 0) {
                btn.querySelector('.menu-input').value = Number(btn.querySelector('.menu-input').value) - 1;
            }

            if (btn.querySelector('.menu-input').value == 0) {
                btn.querySelector('.menu-input').value = '';
                menuItem.classList.add('d-none');
                menuItem.querySelector('.modal-menu-count').innerHTML = 0;
                menuItem.querySelector('.modal-menu-sum').innerHTML = 0;
            }

            let giftBtn = document.querySelector('#option-4');
            let isGiftOn = giftBtn.checked;
            if (isGiftOn) {
                giftBtn.checked = false;
                OnGiftBtn(giftBtn);
            }

            if (btn.querySelector('.menu-input').value) {
                let count = Number(btn.querySelector('.menu-input').value);
                let price = Number(menuItem.querySelector('.modal-menu-price').innerHTML);

                menuItem.classList.remove('d-none');
                if (document.querySelector('#option-3').checked) {
                    let nonContactn = document.querySelector('.modal-option-3').querySelector('.modal-menu-name').innerHTML;
                    if (menuItem.querySelector('.modal-menu-name').innerHTML == nonContactn) {
                        menuItem.querySelector('.modal-menu-count').innerHTML = count;
                    } else {
                        menuItem.querySelector('.modal-menu-count').innerHTML = count;
                    }
                } else {
                    menuItem.querySelector('.modal-menu-count').innerHTML = count;
                }
                menuItem.querySelector('.modal-menu-sum').innerHTML = count * price;
            }


            let FinalCheck = 0;
            for (let elem of modalMenuInfo.querySelectorAll('.modal-menu-element')) {
                FinalCheck += Number(elem.querySelector('.modal-menu-sum').innerHTML);
            }
            document.querySelector('.totalPrice').innerHTML = FinalCheck;
            document.querySelector('.modal-total-price').innerHTML = FinalCheck;

            if (FinalCheck == 0) document.querySelector(".checkBtn").setAttribute('disabled', 'disabled');
            else document.querySelector(".checkBtn").disabled = false;
        };
    }
}

// Создание элемента из списка меню
function MenuPosition(price, elem) {
    let item = document.querySelector('#menuItem-template').cloneNode(true);
    item.querySelector('.menu-name').innerHTML = elem['name'];
    item.querySelector('.menu-img').setAttribute('src', elem['image']);
    item.querySelector('.menu-desc').innerHTML = elem['desc'];
    item.querySelector('.menu-price').innerHTML = price;
    item.classList.remove('d-none');
    return item;
}

// Запись имени элемента
function ModalMenuItem(cont, name) {
    for (let menuItem of cont.querySelectorAll('.modal-menu-element')) {
        if (menuItem.querySelector('.modal-menu-name').innerHTML == name) {
            return menuItem;
        }
    }
}

// Меню ресторана
let menu = [
    {
        'name': 'Пицца Ассорти',
        'desc': '4 разных вкуса.',
        'image': 'images/menu_pizza.jpg'
    },
    {
        'name': 'Шеф-Бургер',
        'desc': 'С 2 котлетами.',
        'image': 'images/menu_burger.jpg'
    },
    {
        'name': 'Борщ',
        'desc': 'Красный и вкусный.',
        'image': 'images/menu_borzik.jpg'
    },
    {
        'name': 'Суши Сет',
        'desc': 'Суши на всю компанию.',
        'image': 'images/menu_sushi.jpg'
    },
    {
        'name': 'Pepsi Cola',
        'desc': 'Прохладный напиток.',
        'image': 'images/menu_pepsi.jpg'
    },
    {
        'name': 'Курица-гриль',
        'desc': 'Горячая и сочная.',
        'image': 'images/menu_chiken.jpg'
    },
    {
        'name': 'Пицца Пепперони',
        'desc': 'Очень острая.',
        'image': 'images/menu_pizza_peperony.jpg'
    },
    {
        'name': 'Греческий салат',
        'desc': 'Прохладный салат для любителей тонкого вкуса.',
        'image': 'images/menu_salad_grek.jpg'
    },
    {
        'name': 'Запеченный лосось',
        'desc': 'Прямо из моря.',
        'image': 'images/menu_losos.jpg'
    },
    {
        'name': 'Картошка фри',
        'desc': 'Идет вместе с соусом',
        'image': 'images/menu_kartoxa.jpg'
    }
]

window.onload = function () {
    Loader(); // Загрузчик отвечает за фильтрация ресторанов и меню

    // Фильтрация по кнопке "Найти"
    document.querySelector('.searbutt').onclick = function () {
        FilterTake();
    }
    // Поиск фильтров по округу
    document.querySelector('#OkrugInp').onchange = function () {
        Givefiltres('admArea', '');
    }
    // Поиск фильтров по району
    document.querySelector('#AreaInp').onchange = function () {
        Givefiltres('district', '');
    }
    // Пагинация страниц
    document.querySelector('.pagination').onclick = pagination;
    
    // Бесконтакная доставка
    document.querySelector('#option-3').onchange = function (event) {
        NonContact(event.target);
    }
    // Подарок
    document.querySelector('#option-4').onchange = function (event) {
        OnGiftBtn(event.target);
    }
}
