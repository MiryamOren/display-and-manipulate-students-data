// global consts
const API = 'https://apple-seeds.herokuapp.com/api/users/';
const table = document.querySelector('table');


class Students {
  constructor(){
    this.studentsArr = [];
    this.studentsProperties = [
      'id',
      'first-name',
      'last-Name',
      'capsule',
      'age',
      'city',
      'gender',
      'hobby'
    ];
    this.propertiesNum = 8;
    this.currentlyDisplayed;
  }
  getStudents(){
    return this.studentsArr;
  }
  setStudents(studentsArr){
    this.studentsArr = studentsArr;
    this.currentlyDisplayed = this.studentsArr;
  }
  filterArrBy(propertyIndex, searchTxt){
    const relevantStudents = this.studentsArr.filter(tr =>{
      return [...tr.childNodes][propertyIndex].innerHTML.toLowerCase().includes(searchTxt.toLowerCase());
    });
    document.querySelector('tbody').innerHTML = '';
    relevantStudents.forEach(tr => {
      document.querySelector('tbody').appendChild(tr);
    });
    console.log(relevantStudents);
    this.currentlyDisplayed = relevantStudents;
  }
  sortArrBy(propertyIndex){
    // numbers
    const numbers = new Set([0, 3, 4]);
    if (numbers.has(propertyIndex)){
      this.currentlyDisplayed.sort((tr1, tr2) => {
        return [...tr1.childNodes][propertyIndex].innerHTML - [...tr2.childNodes][propertyIndex].innerHTML;
      });
    }
    // letters
    const letters = new Set([1, 2, 5, 6, 7]);
    if (letters.has(propertyIndex)){
      this.currentlyDisplayed.sort((tr1, tr2) => {
        const word1 = [...tr1.childNodes][propertyIndex].innerHTML.toLowerCase();
        const word2 = [...tr2.childNodes][propertyIndex].innerHTML.toLowerCase();
        if (word1 < word2){ 
          return -1;
        }
        else if (word1 > word2) {
           return 1;
        }
        return 0;
      });
    }
    document.querySelector('tbody').innerHTML = '';
    this.currentlyDisplayed.forEach(tr => {
      document.querySelector('tbody').appendChild(tr);
    });
  }
  updateLocalStorage(){
    const studentsArrStr = this.studentsArr.map(tr => tr.outerHTML);
    window.localStorage.setItem('studentsArr', JSON.stringify(studentsArrStr));
    console.log(JSON.stringify(this.studentsArr));
    console.log(JSON.stringify(studentsArrStr));
  }
  studentsArrInitializing(studentsData){
    this.createHeadings();
    studentsData.forEach(studentObj => {
      this.addStudent(studentObj)
    });
    console.log('im here');
    this.updateLocalStorage();
    this.currentlyDisplayed = this.studentsArr;
  }
  createHeadings(){
    console.log('createHeadings is called');
    const tr = document.createElement('tr');
    this.studentsProperties.forEach((property, indx) => {
      const th = document.createElement('th');
      const btn = document.createElement('button');
      btn.innerHTML = property.split('-').join(' ').toUpperCase();
      btn.setAttribute('data-sort', indx);
      th.appendChild(btn);
      tr.appendChild(th);
    });
    document.querySelector('thead').appendChild(tr);
  }
  addStudent(studentObj){
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', studentObj.id);
    this._createDataTds(Object.values(studentObj), tr);
    this._createTrBtns('edit', 'delete', tr, false)
    table.appendChild(tr);
    this.studentsArr.push(tr);
  }
  _createDataTds(dataArr, tr){
    dataArr.forEach(property => {
      const td = document.createElement('td');
      td.innerHTML = property;
      tr.appendChild(td);
    });
  }
  _createTrBtns(btn1Name, btn2Name, tr, update){
    const btn1 = document.createElement('button');
    btn1.innerHTML = btn1Name;
    const btn2 = document.createElement('button');
    btn2.innerHTML = btn2Name;
    if (update){
      [...tr.childNodes][this.propertiesNum].remove();
    }
    const td = document.createElement('td');
    td.appendChild(btn1);
    td.appendChild(btn2);
    tr.appendChild(td);
    
  }
  editStudentData(tr){
    const tdToUpdate = [...tr.childNodes];
    tdToUpdate.shift();
    tdToUpdate.pop();
    tdToUpdate.forEach(propertyTd => {
      const input = document.createElement('input');
      input.value = propertyTd.innerHTML;
      input.setAttribute('data-origin-content', propertyTd.innerHTML);
      propertyTd.innerHTML = '';
      propertyTd.appendChild(input);
    });
    this._createTrBtns('cancel', 'confirm', tr, true);
  }
  cancelOrConfirmEdit(tr, confirm){
    const tdToUpdate = [...tr.childNodes];
    tdToUpdate.shift();
    tdToUpdate.pop();
    tdToUpdate.forEach(propertyTd => {
      const propertyContent = confirm? propertyTd.firstChild.value : propertyTd.firstChild.dataset.originContent;
      propertyTd.innerHTML = propertyContent;
    });
    this._createTrBtns('edit', 'delete', tr, true);
  }
  deleteStudent(tr){
    const trIndx = this.studentsArr.indexOf(tr);
    this.studentsArr.splice(trIndx, 1);
    tr.remove();
  }
  updateStudentData(event){
    console.log('click');
    const btn = event.target;
    if (btn.tagName === 'BUTTON'){
      const tr = btn.parentElement.parentElement;
      switch(btn.innerHTML) {
        case 'edit':
          this.editStudentData(tr);
          break;
        case 'delete':
          this.deleteStudent(tr);
          this.updateLocalStorage();
          break;
        case 'cancel':
          this.cancelOrConfirmEdit(tr, false);
          break;
        case 'confirm':
          this.cancelOrConfirmEdit(tr, true);
          this.updateLocalStorage();
          break;
        default:
          // do nothing
      }
    } 
  }
}

// on page load
async function fetchStudentsData(){
  const fetchRes = await fetch(API);
  const allStudents = await fetchRes.json();
  
  const detailsData = allStudents.map(async student => {
    const preFetchData = await fetch(`${API}${student.id}`)
    return preFetchData.json()
  })
  const extraData = await Promise.all(detailsData);

  const allStudentsWithExstra = [];
  for (let i = 0; i < allStudents.length; i++){
    const student = allStudents[i];
    const extra = extraData[i];
    allStudentsWithExstra.push({...student, ...extra});
  }
  students.studentsArrInitializing(allStudentsWithExstra);
}

const students = new Students();
// window.localStorage.clear();
if (window.localStorage.getItem('studentsArr')){
  console.log();
  let studentsTrs = '';
  const rawStudentsArr = JSON.parse(window.localStorage.getItem('studentsArr'));
  rawStudentsArr.forEach(tr => {
    studentsTrs += tr;
  });
  students.createHeadings();
  document.querySelector('tbody').innerHTML = studentsTrs;
  students.setStudents([...document.querySelector('tbody').childNodes]);
}
else {
  fetchStudentsData();
}


// event listners
function tableClick(event){
  if (event.target.dataset.sort){
    students.sortArrBy(eval(event.target.dataset.sort));
  }
  else{
    students.updateStudentData(event);
  }
}
table.addEventListener('click', tableClick);


function search(event){
  const searchTxt = document.querySelector('.search-field').value;
  const parameter = document.querySelector('select').value;
  students.filterArrBy(students.studentsProperties.indexOf(parameter), searchTxt)
}

const searchField = document.querySelector('.search-field');
searchField.addEventListener('keyup', search);
const selectParam = document.querySelector('select');
selectParam.addEventListener('click', search);
