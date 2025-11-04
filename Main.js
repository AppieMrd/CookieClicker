class Game{
Cookies = 0;
name;
workers = 0;

  addCookie() {
    this.Cookies++;
    document.getElementById("AmountOfCookies").innerHTML = this.Cookies;
  }

  hireWorker() {
    this.workers
  }


}

let myGame = new Game;











/*var Cookies = 0;
var Workers = 0;
var CookiesMutiple = 1;
var AreWorkersWorking = false;

function CookieMaker(){
Cookies = Cookies +1;    
document.getElementById("AmountOfCookies").innerHTML = Cookies;
}

function WorkersMakeCookies(){
Cookies = Cookies + (Workers * CookiesMutiple);    
document.getElementById("AmountOfCookies").innerHTML = Cookies;
}

function HireWorker(){
    Workers = Workers +1;
    if (AreWorkersWorking==false){
        AreWorkersWorking=true;    
        setInterval(function(){
        WorkersMakeCookies()
    }, 1000)
    }


    document.getElementById("AmountOfWorkers").innerHTML = Workers;
} */