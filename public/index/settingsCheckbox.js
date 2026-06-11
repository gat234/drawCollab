window.addEventListener('load', async function () {
    let p = document.getElementById("checkPassword");
    let n = document.getElementById("checkName");
    if(p.checked){
        document.getElementById("pass").classList.remove("hidden");
    }else{
        document.getElementById("pass").classList.add("hidden");
    }
    if(n.checked){
        document.getElementById("nam").classList.remove("hidden");
    }else{
        document.getElementById("nam").classList.add("hidden");
    }
    p.onclick = function(e){
        if(e.target.checked){
            document.getElementById("pass").classList.remove("hidden");
        }else{
            document.getElementById("pass").classList.add("hidden");
        }
    };
    n.onclick = function(e){
        if(e.target.checked){
            document.getElementById("nam").classList.remove("hidden");
        }else{
            document.getElementById("nam").classList.add("hidden");
        }
    };
})
