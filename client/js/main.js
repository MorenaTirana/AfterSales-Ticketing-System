document.addEventListener("DOMContentLoaded",()=>{

    document.getElementById("loginBtn").addEventListener("click",login);

});

async function login(){

    const email=document.getElementById("email").value.trim();
    const password=document.getElementById("password").value.trim();

    try{

        const response=await fetch("http://localhost:3001/api/login",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                email,
                password
            })

        });

        const data=await response.json();

        if(data.success){

            localStorage.setItem("user",JSON.stringify(data.user));

            window.location.href="dashboard.html";

        }else{

            document.getElementById("errore").innerHTML=data.message;

        }

    }catch(err){

        console.log(err);

        document.getElementById("errore").innerHTML="Server non raggiungibile";

    }

}
