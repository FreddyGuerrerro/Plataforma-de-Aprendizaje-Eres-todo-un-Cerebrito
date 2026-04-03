document.addEventListener("DOMContentLoaded", function(){

// -------------------- LOGIN --------------------
window.login = function(){
    let u=document.getElementById("usuario")?.value.trim();
    let p=document.getElementById("password")?.value.trim();

    if(!u || !p){
        alert("Ingrese datos");
        return;
    }

    if(p!=="0000"){
        alert("Contraseña incorrecta");
        return;
    }

    let n=parseInt(u);

    if(n>=1 && n<=20){
        localStorage.setItem("rol","profesor");
        localStorage.setItem("idProfesor", u);
        location.href="profesor.html";
    }
    else if(n>=21 && n<=500){
        localStorage.setItem("rol","alumno");
        localStorage.setItem("idEstudiante", u);
        location.href="grados.html";
    }else{
        alert("Usuario inválido");
    }
}

// -------------------- INGRESAR ESTUDIANTE --------------------
window.ingresarEstudiante = function(){
    let id=document.getElementById("idEstudiante").value.trim();
    if(!id){
        alert("Ingrese ID estudiante");
        return;
    }

    localStorage.setItem("idEstudiante", id);
    location.href="grados.html";
}

// -------------------- NAVEGACIÓN --------------------
window.irGrado = function(g){
    localStorage.setItem("grado",g);
    location.href="asignaturas.html";
}

window.irAsignatura = function(a){
    localStorage.setItem("asignatura",a);
    location.href="actividades.html";
}

window.volver = function(){history.back();}
window.inicio = function(){location.href="index.html";}

// -------------------- MOSTRAR IDS --------------------
let rol=localStorage.getItem("rol");
let area=document.getElementById("area");
let idProf = localStorage.getItem("idProfesor") || "-";
let idEst = localStorage.getItem("idEstudiante") || "-";

if(area){
    if(rol==="profesor"){
        area.innerText = `AREA PROFESOR | Profesor: ${idProf} | Estudiante: ${idEst}`;
    }else{
        area.innerText = `AREA ESTUDIANTE | ID: ${idEst}`;
    }
}

// -------------------- TABLAS ACTIVIDADES --------------------
if(document.getElementById("tablas")){
    crearTablas();
    bloquearAlumno();
    cargarDatos();
}

// -------------------- CREAR TABLAS --------------------
function crearTablas(){
    let cont=document.getElementById("tablas");
    if(!cont) return;
    cont.innerHTML="";

    for(let c=1;c<=3;c++){
        let html=`<h3>CORTE ${c}</h3>
        <table>
        <tr>
        <th>Tipo</th>
        <th>Nombre</th>
        <th>Fecha</th>
        <th>Vinculo</th>
        <th>Nota</th>
        <th>Ponderación</th>
        <th>Promedio</th>
        </tr>`;

        let tipos=["Tarea","Tarea","Cuestionario"];
        for(let i=0;i<3;i++){
            html+=`<tr>
            <td>${tipos[i]}</td>
            <td><input class="nombre"></td>
            <td><input class="fecha" placeholder="dd/mm/aaaa"></td>
            <td>
            ${tipos[i]=="Tarea"
                ? '<input type="file" class="vinculo">'
                : '<input placeholder="URL" class="vinculo">'}
            </td>
            <td><input class="nota"></td>
            <td><input class="peso"></td>
            <td class="prom"></td>
            </tr>`;
        }
        html+="</table>";
        cont.innerHTML+=html;
    }

    // Evento de cálculo y formateo %
    document.querySelectorAll(".nota, .peso").forEach(i=>{
        i.addEventListener("input", ()=>{
            if(i.classList.contains("peso")){
                // Formatear con % si no está vacío
                let val = parseFloat(i.value) || 0;
                i.value = val + "%";
            }
            calcular();
        });
    });
}

// -------------------- BLOQUEAR ALUMNOS --------------------
function bloquearAlumno(){
    if(rol==="alumno"){
        document.querySelectorAll("input").forEach(i=>{
            if(!i.classList.contains("vinculo")){
                i.disabled=true;
            }
        });
    }
}

// -------------------- CALCULAR PROMEDIOS --------------------
function calcular(){
    let filas=document.querySelectorAll("table tr");
    let total=0;
    let suma=0;

    filas.forEach(f=>{
        let nota=f.querySelector(".nota");
        let peso=f.querySelector(".peso");

        if(nota && peso){
            // Remover % para cálculo
            let n=parseFloat(nota.value) || 0;
            let p=parseFloat(peso.value.replace("%","")) || 0;

            suma+=n*p;
            total+=p;

            let promCelda=f.querySelector(".prom");
            if(promCelda){
                promCelda.innerText = p>0 ? (n*p/p).toFixed(2) : "0.00";
            }
        }
    });

    let promedio = total>0 ? suma/total : 0;
    let promGen=document.getElementById("promedioGeneral");
    let notaDef=document.getElementById("notaDefinitiva");
    if(promGen) promGen.innerText=promedio.toFixed(2);
    if(notaDef) notaDef.innerText=promedio.toFixed(2);
}

// -------------------- GUARDAR DATOS --------------------
window.guardarCambios = function(){
    let tablas=document.querySelectorAll("table");
    let datos = [];

    tablas.forEach(tab=>{
        let corte=[];
        tab.querySelectorAll("tr").forEach((f,i)=>{
            if(i===0) return;
            let nombre=f.querySelector(".nombre")?.value || "";
            let fecha=f.querySelector(".fecha")?.value || "";
            let vinculo=f.querySelector(".vinculo")?.value || "";
            let nota=f.querySelector(".nota")?.value || "";
            let peso=f.querySelector(".peso")?.value || "";

            // Guardar sin % para consistencia
            peso = peso.replace("%","");

            corte.push({nombre, fecha, vinculo, nota, peso});
        });
        datos.push(corte);
    });

    let comentarios=document.getElementById("comentarios")?.value || "";

    localStorage.setItem(`datos_${idEst}_${localStorage.getItem("asignatura")}`, JSON.stringify({datos, comentarios, grado: localStorage.getItem("grado") || "-", idProfesor: idProf}));
    alert("Datos guardados correctamente");
}

// -------------------- CARGAR DATOS --------------------
function cargarDatos(){
    let almacenados = localStorage.getItem(`datos_${idEst}_${localStorage.getItem("asignatura")}`);
    if(!almacenados) return;

    let obj = JSON.parse(almacenados);
    let tablas = document.querySelectorAll("table");

    tablas.forEach((tab,c)=>{
        let corte = obj.datos[c];
        if(!corte) return;
        tab.querySelectorAll("tr").forEach((f,i)=>{
            if(i===0) return;
            let fila = corte[i-1];
            if(!fila) return;

            f.querySelector(".nombre").value = fila.nombre || "";
            f.querySelector(".fecha").value = fila.fecha || "";
            let vinc = f.querySelector(".vinculo");
            if(vinc) vinc.value = fila.vinculo || "";
            f.querySelector(".nota").value = fila.nota || "";
            f.querySelector(".peso").value = fila.peso ? fila.peso + "%" : "";
        });
    });

    if(obj.comentarios){
        let t=document.getElementById("comentarios");
        t.value=obj.comentarios;
        if(rol==="alumno") t.disabled=true;
    }

    calcular();
}

});

