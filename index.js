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
  filterArrBy(propertyIndex, searchTxt){
    const relevantStudents = this.studentsArr.filter(tr =>{
      return [...tr.childNodes][propertyIndex].innerHTML.toLowerCase().includes(searchTxt.toLowerCase());
    });
    table.innerHTML = '';
    this.createHeadings();
    relevantStudents.forEach(tr => {
      table.appendChild(tr);
    })
    console.log(relevantStudents);
  }
  studentsArrInitializing(studentsData){
    this.createHeadings();
    studentsData.forEach(studentObj => {
      this.addStudent(studentObj)
    });
    window.localStorage.setItem('studentsArr', JSON.stringify(this.studentsArr));
    console.log(window.localStorage.getItem('studentsArr'));
    console.log(this.studentsArr);
  }
  createHeadings(){
    const tr = document.createElement('tr');
    this.studentsProperties.forEach(property => {
      const th = document.createElement('th');
      th.innerHTML = property.split('-').join(' ').toUpperCase();
      tr.appendChild(th);
    });
    table.appendChild(tr);
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
          break;
        case 'cancel':
          this.cancelOrConfirmEdit(tr, false);
          break;
        case 'confirm':
          this.cancelOrConfirmEdit(tr, true);
          break;
        default:
          // do nothing
      }
    } 
  }
}

// on page load
let students;

// if (students)
async function studentsData(){
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

  students = new Students();
  students.studentsArrInitializing(allStudentsWithExstra);
}
studentsData();



// event listners
function tableClick(event){
  students.updateStudentData(event);
}
table.addEventListener('click', tableClick);


function search(event){
  const searchTxt = event.target.value;
  const parameter = document.querySelector('select').value;
  students.filterArrBy(students.studentsProperties.indexOf(parameter), searchTxt)
}

const searchField = document.querySelector('.search-field');
searchField.addEventListener('keyup', search);