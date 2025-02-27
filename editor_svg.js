
let editor, desen, sel_rect, sel_line, sel_ellip
let RectBtn, LineBtn, EllipseBtn, EditBtn, EditMenu, Line_width, Color_add

const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 2;
let x1 = 0, y1 = 0, mx = 0, my = 0;
let elementSelectat = null;
let isRectActive = false;
let isLineActive = false;
let isEllipseActive = false;
let elementSelectat_clicked = false;
let previous_color_fill = null;
let previous_color_stroke = null;
let history = [];


function exportAsImage(format) {
    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(editor);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    // Dimensiuni pentru canvas (egale cu cele ale SVG-ului)
    const bbox = editor.getBoundingClientRect();
    canvas.width = bbox.width;
    canvas.height = bbox.height;

    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url); 

       
        const imageType = format === "jpeg" ? "image/jpeg" : "image/png";
        const link = document.createElement("a");
        link.href = canvas.toDataURL(imageType, 1.0);
        link.download = `exported_image.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    img.src = url;
}

//Functie ce salveaza desenul curent in local storage
function saveDrawing() {
    const svgContent = document.getElementById('desen').innerHTML;
//Stocam datele folosind metoda localStorage.setItem 
    localStorage.setItem('drawing', svgContent);
    localStorage.setItem('prev_color_fill', previous_color_fill);
    localStorage.setItem('prev_color_stroke', previous_color_stroke);

}

//Functie ce incarca desenul salvat anterior, din local storage
function loadDrawing() {
//Preluam datele din local storage folosind metoda localStorage.getItem in functie de cheia drawing
    const savedDrawing = localStorage.getItem('drawing');
    //Daca exista un desen salvat, adauga continutul salvat si creaza o lista cu toate formele din desen
    if (savedDrawing) {
        desen.innerHTML = savedDrawing;
        const shapes = desen.children;
        for(let i = 0; i < shapes.length; i++){
            shapes[i].addEventListener('contextmenu', Shape_contextmenu);
            history.push(shapes[i]);
        }
       
    }
    elementSelectat = document.getElementsByClassName('selectat')[0];
    //Daca este un element selectat, preia culoarea si conturul acestuia, in cazul selectarii ulterioare a altei forme
    if(elementSelectat){
        previous_color_fill = localStorage.getItem('prev_color_fill');
        previous_color_stroke = localStorage.getItem('prev_color_stroke');
        elementSelectat.addEventListener("mousedown", elementSelectat_mousedown);
    }
}




//Functie pentru setarea coordonatelor unui dreptunghi(x,y pozitie; width, height dimensiune)
function setareCoordonateRect(elem, x1, y1, x2, y2) {
    elem.setAttribute("x", Math.min(x1, x2));
    elem.setAttribute("y", Math.min(y1, y2));
    elem.setAttribute("width", Math.max(x1, x2) - Math.min(x1, x2));
    elem.setAttribute("height", Math.max(y1, y2) - Math.min(y1, y2));
};

//Functie pentru setarea coordonatelor unei linii
function setareCoordonateLine(elem, x1, y1, x2, y2) {
    elem.setAttribute("x1", x1);
    elem.setAttribute("y1", y1);
    elem.setAttribute("x2", x2);
    elem.setAttribute("y2", y2);
};

//Functie pentru setarea coordonatelor unei elipse(centrul si razele)
function setareCoordonateEllip(elem, x1, y1, x2, y2) {
    elem.setAttribute("cx", (x1+x2)/2);
    elem.setAttribute("cy", (y1+y2)/2);
    elem.setAttribute("rx", Math.abs((x2 - x1)/2));
    elem.setAttribute("ry", Math.abs((y2 - y1)/2));
};

//Functia pentru initializarea desenarii fiecarei forme
function editor_mousedown(e){
    if (e.button == MOUSE_LEFT) {
        x1 = mx;
        y1 = my;
        //Daca este activa desenarea dreptunghiului, atunci permitem vizualizarea si setam coordonatele de inceput
        if(isRectActive){
            sel_rect.style.display = 'block'
            setareCoordonateRect(sel_rect, x1, y1, mx, my)
        }
        //Daca este activa desenarea liniei, atunci permitem vizualizarea si setam coordonatele de inceput
        else if(isLineActive){
            sel_line.style.display = 'block'
            sel_line.style.strokeWidth = Line_width.value;
            setareCoordonateLine(sel_line, x1, y1, mx, my)
        }
        //Daca este activa desenarea cercului, atunci permitem vizualizarea si setam coordonatele de inceput
        else if(isEllipseActive){
            sel_ellip.style.display = 'block'
            setareCoordonateEllip(sel_ellip, x1, y1, mx, my)
        }
    }
}

//Functie pentru evenimentul de click dreapta
function Shape_contextmenu(e){
    e.preventDefault();

    //Se verifica daca exista un element selectat
    if (elementSelectat != null) {
    //In cazul in care este selectat un alt element, elementul selectat anterior revine la culoarea/conturul sau anterior
        elementSelectat.style.fill = previous_color_fill;
        elementSelectat.style.stroke = previous_color_stroke;
    //Elementul se deselecteaza
        elementSelectat.classList.remove('selectat');
    //Eliminam ascultarea evenimentului
        elementSelectat.removeEventListener("mousedown", elementSelectat_mousedown);
    }

    //Salvam culoarea si conturul formei selectate
    previous_color_fill = e.target.style.fill;
    previous_color_stroke = e.target.style.stroke;
    //Atunci cand este selectata forma, schimbam culoarea in rosu
    e.target.style.fill = "#ff0000";
    //In cazul in care forma este o linie, culoarea sa(conturul) devine rosu, altfel conturul devine negru
    if(e.target.tagName == "line")
        e.target.style.stroke = "#ff0000";
    else
        e.target.style.stroke = "#000000"
    //Salvam elementul selectat in variabila elementSelectat
    elementSelectat = e.target;
    //Adaugam clasa 'selectat' pentru acest element
    e.target.classList.add('selectat');
    //Adaugam ascultarea evenimentului "mousdown" pentru miscarea elementului selectat
    e.target.addEventListener("mousedown", elementSelectat_mousedown);
    //Salvam starea actuala a desenului, cu tot cu modificarile sale
    saveDrawing();
}

//Functia ce permite desenarea formei active
function editor_mouseup(e){
    if(e.button != MOUSE_LEFT){
        return;
    }
    //Dezactivam miscarea elementului cand butonul de mouse este ridicat
    elementSelectat_clicked = false;
    //Sunt ascunse ghidajele pentru selectia formei
    sel_rect.style.display = 'none'
    sel_line.style.display = 'none'
    sel_ellip.style.display = 'none'
    //Daca este activa desenarea dreptunghiului, atunci se creaza un element svg de tip dreptunghi
    if(isRectActive){
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        setareCoordonateRect(rect, x1, y1, mx, my);
        //Dreptunghiul preia culoarea selectata de utilizator
        rect.style.fill = Color_add.value;
        //Adaugam dreptunghiul la desenul initial
        desen.append(rect);
        //pentru dreptumghi, adaugam evenimentul de click dreapta
        rect.addEventListener('contextmenu', Shape_contextmenu);
        //Dezactivam desenarea dreptunghiului
        isRectActive = false;

        history.push(rect);

    }
    //Daca este activa desenarea liniei, atunci se creaza un element svg de tip linie
    else if(isLineActive){
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        setareCoordonateLine(line, x1, y1, mx, my);
        //Linia preia grosimea si culoarea selectata de utilizator
        line.style.strokeWidth = Line_width.value;
        line.style.stroke = Color_add.value;
        //Adaugam linia la desenul initial
        desen.append(line);
        //Adaugam evenimentul de click dreapta
        line.addEventListener('contextmenu', Shape_contextmenu);
        //Dezactivam desenarea liniei
        isLineActive = false;

        history.push(line);
    }
    //Daca este activa desenarea elipsei, atunci se creaza un element svg de tip elipsa
    else if(isEllipseActive){
        let ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        setareCoordonateEllip(ellipse, x1, y1, mx, my);
        //Elipsa preia culoarea selectata de utlizator
        ellipse.style.fill = Color_add.value;
        //Adaugam forma la desen
        desen.append(ellipse);
        //Adaugam evenimentul de click dreapta
        ellipse.addEventListener('contextmenu', Shape_contextmenu);
        //Dezactivam desenarea elipsei
        isEllipseActive = false;

        history.push(ellipse);
    }
    //Salvam desenul actual, cu toate modificarile facute
    saveDrawing();
        
}

//Functia pentru actualizarea coordonatelor in editor
function editor_mousemove(e) {
    //Determinarea coordonatelor cursorului pe editor
    mx = Math.round(e.x - editor.getBoundingClientRect().x);
    my = Math.round(e.y - editor.getBoundingClientRect().y);
    //Setarea coordonatelor de selectie pentru fiecare forma, in functie de alegerea utilizatorului
    if (isRectActive) {
        setareCoordonateRect(sel_rect, x1, y1, mx, my);
    }
    else if(isLineActive){
        setareCoordonateLine(sel_line, x1, y1, mx, my);
    }
    else if(isEllipseActive){
        setareCoordonateEllip(sel_ellip, x1, y1, mx, my);
    }
    //Daca utlizatorul tine apasat pe un element selectat
    else if(elementSelectat_clicked){
        if (elementSelectat.tagName == "rect") {
            //Setam noile coordonate ale dreptunghiului apasat
            let x = parseInt(elementSelectat.getAttribute("x"));
            let new_x = x + (mx - x1);
            elementSelectat.setAttribute("x", new_x);
            x1 = mx;
            let y = parseInt(elementSelectat.getAttribute("y"));
            let new_y = y + (my - y1);
            elementSelectat.setAttribute("y", new_y);
            y1 = my;
        }
        else if (elementSelectat.tagName == "line") {
            //Setam noile coordonate ale liniei apasate
            let x0 = parseInt(elementSelectat.getAttribute("x1"));
            let x2 = parseInt(elementSelectat.getAttribute("x2"));
            let y0 = parseInt(elementSelectat.getAttribute("y1"));
            let y2 = parseInt(elementSelectat.getAttribute("y2"));
            let new_x0 = x0 + (mx - x1);
            let new_x2 = x2 + (mx - x1);
            elementSelectat.setAttribute("x1", new_x0);
            elementSelectat.setAttribute("x2", new_x2);
            x1 = mx;
            let new_y0 = y0 + (my - y1);
            let new_y2 = y2 + (my - y1);
            elementSelectat.setAttribute("y1", new_y0);
            elementSelectat.setAttribute("y2", new_y2);
            y1 = my;
        }
        //Setam noile coordonate ale elipsei apasate
        else if(elementSelectat.tagName == "ellipse"){
            let cx = parseInt(elementSelectat.getAttribute("cx"));
            let new_cx = cx + (mx - x1);
            elementSelectat.setAttribute("cx", new_cx);
            x1 = mx;
            let cy = parseInt(elementSelectat.getAttribute("cy"));
            let new_cy = cy + (my - y1);
            elementSelectat.setAttribute("cy", new_cy);
            y1 = my;
        }
    }
}

//Functie se activeaza cand se apasa buton-ul de mouse stanga pe elementul selectat
function elementSelectat_mousedown(e){
    if(e.button == MOUSE_LEFT){
        //Activam o variabila ce permite mutarea elementului selectat
        elementSelectat_clicked = true;
    }
}

//Functii ce seteaza starea fiecarei forme in functie de butonul selectat
function RectBtn_click(e){
    isRectActive = true;
    isLineActive = false;  
    isEllipseActive = false;
}
function LineBtn_click(e){
    isRectActive = false;
    isLineActive = true;  
    isEllipseActive = false;
}
function EllipseBtn_click(e){
    isRectActive = false;
    isLineActive = false;  
    isEllipseActive = true;
}

//Functie ce transforma o componeneta numerica intr-o forma HEX
function componentToHex(c) {
    var hex = parseInt(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

//Functie ce transforma propietatea css color (rbg string) in hex
function rgbToHex(rgb) {
    var rgb_nums = rgb.split("(")[1].split(")")[0];
    rgb_nums = rgb_nums.split(",");
    return "#" + componentToHex(rgb_nums[0]) + componentToHex(rgb_nums[1]) + componentToHex(rgb_nums[2]);
}

//Functie pentru crearea meniului de editarea
function EditBtn_click(e){
    if(elementSelectat == null)
        return;
    //Golim menul-ul edit anterior
    EditMenu.innerHTML = "";
    if (elementSelectat.tagName == 'rect') {
        //Creare campuri de input in in menu pentru latime, inaltime si culoare
        if (previous_color_fill[0] != '#')
            previous_color_fill = rgbToHex(previous_color_fill);
        EditMenu.insertAdjacentHTML("beforeend", "<label for=\"width\">Width: </label>");
        EditMenu.insertAdjacentHTML("beforeend", "<input type=\"number\" id = \"width\" value=\"" + elementSelectat.getAttribute("width") + "\">");
        EditMenu.insertAdjacentHTML("beforeend", "<label for=\"height\">Height: </label>");
        EditMenu.insertAdjacentHTML("beforeend", "<input type=\"number\" id = \"height\" value=\"" + elementSelectat.getAttribute("height") + "\">");
        EditMenu.insertAdjacentHTML("beforeend", "<label for=\"color\">Color: </label>");
        EditMenu.insertAdjacentHTML("beforeend", "<input type=\"color\" id = \"color\" value=\"" + previous_color_fill + "\">");
    }
    else if (elementSelectat.tagName == 'line') {
        //Creare campuri de input in menu pentru grosimea liniei si culoarea sa
        let style = window.getComputedStyle(elementSelectat);
        let stroke_width = style.getPropertyValue('stroke-width');
        stroke_width = stroke_width.substring(0, stroke_width.length - 2);
        if (previous_color_stroke[0] != '#')
            previous_color_stroke = rgbToHex(previous_color_stroke);
        EditMenu.insertAdjacentHTML("beforeend", "<label for=\"thickness\">Thickness: </label>");
        EditMenu.insertAdjacentHTML("beforeend", "<input type=\"number\" id = \"thickness\" value=\"" + stroke_width + "\">");
        EditMenu.insertAdjacentHTML("beforeend", "<label for=\"color\">Color: </label>");
        EditMenu.insertAdjacentHTML("beforeend", "<input type=\"color\" id = \"color\" value=\"" + previous_color_stroke + "\">");
    }
    else if (elementSelectat.tagName == 'ellipse') {
        //Creare campuri de input in menu pentru raza rx, ry si culoarea cercului
        if (previous_color_fill[0] != '#')
            previous_color_fill = rgbToHex(previous_color_fill);
        EditMenu.insertAdjacentHTML("beforeend", "<label for=\"rx\">X Radius: </label>");
        EditMenu.insertAdjacentHTML("beforeend", "<input type=\"number\" id = \"rx\" value=\"" + elementSelectat.getAttribute("rx") + "\">");
        EditMenu.insertAdjacentHTML("beforeend", "<label for=\"ry\">Y Radius: </label>");
        EditMenu.insertAdjacentHTML("beforeend", "<input type=\"number\" id = \"ry\" value=\"" + elementSelectat.getAttribute("ry") + "\">");
        EditMenu.insertAdjacentHTML("beforeend", "<label for=\"color\">Color: </label>");
        EditMenu.insertAdjacentHTML("beforeend", "<input type=\"color\" id = \"color\" value=\"" + previous_color_fill + "\">");
    }
    //permite vizualizarea meniului de editare
    EditMenu.style.display = 'block';
}
//Functie ce permite modificarea proprietatilor formei selectate din meniul de editare
function EditMenu_click(e){
    e.stopPropagation();
    //Daca elementul selectat este un dreptunghi, se schimba latimea, inaltime si culoarea sa cu valorile selectate
    if (elementSelectat.tagName == 'rect') {
        let width_elem = document.getElementById('width');
        width_elem.addEventListener('change', ev => {
            elementSelectat.setAttribute("width", width_elem.value);
            saveDrawing();
        });
        let height_elem = document.getElementById('height');
        height_elem.addEventListener('change', ev => {
            elementSelectat.setAttribute("height", height_elem.value);
            saveDrawing();
        });
        let color_elem = document.getElementById('color');
        color_elem.addEventListener('change', ev => {
            elementSelectat.style.fill = color_elem.value;
            previous_color_fill = color_elem.value;
            saveDrawing();
        });
    }
    //Daca elementul selectat este o linie, se modifica grosimea si culoarea sa cu valorile selectate de catre utilizator
    else if (elementSelectat.tagName == 'line') {
        let thickness_elem = document.getElementById('thickness');
        thickness_elem.addEventListener('change', ev => {
            elementSelectat.style.strokeWidth = thickness_elem.value;
            saveDrawing();
        });
        let color_elem = document.getElementById('color');
        color_elem.addEventListener('change', ev => {
            elementSelectat.style.stroke = color_elem.value;
            previous_color_stroke = color_elem.value;
            saveDrawing();
        });
    }
    //Daca elementul selectat este o elipsa, se schimba razele si culoarea elipsei cu optiunea din meniul de edit
    else if (elementSelectat.tagName == 'ellipse') {
        let rx_elem = document.getElementById('rx');
        rx_elem.addEventListener('change', ev => {
            elementSelectat.setAttribute("rx", rx_elem.value);
            saveDrawing();
        });
        let ry_elem = document.getElementById('ry');
        ry_elem.addEventListener('change', ev => {
            elementSelectat.setAttribute("ry", ry_elem.value);
            saveDrawing();
        });
        let color_elem = document.getElementById('color');
        color_elem.addEventListener('change', ev => {
            elementSelectat.style.fill = color_elem.value;
            previous_color_fill = color_elem.value;
            saveDrawing();
        });
    }
    
}

//Atunci cand utilizatorul ia mouse-ul de pe meniul de editare, acesta nu se mai afiseaza
function EditMenu_mouseleave(e){
    EditMenu.style.display = 'none';
}


function aplicatie() {
   

    editor = document.getElementById("editor");
    desen = document.getElementById("desen");
    sel_rect = document.getElementById("selectie_rect")
    sel_line = document.getElementById("selectie_line")
    sel_ellip = document.getElementById("selectie_ellip")
    

    Line_width = document.getElementById('line_width');
    Line_width.value = 3;
    Color_add = document.getElementById('add_color');
    Color_add.value = "#006400";
    RectBtn = document.getElementById('btnRect');
    LineBtn = document.getElementById("btnLine");
    EllipseBtn = document.getElementById("btnEllipse");

    EditBtn = document.getElementById("btnEdit");
    EditMenu = document.getElementById("edit_menu");

    RectBtn.addEventListener('click', RectBtn_click);
    LineBtn.addEventListener('click', LineBtn_click);
    EllipseBtn.addEventListener('click', EllipseBtn_click);

    EditBtn.addEventListener('click', EditBtn_click);
    EditMenu.addEventListener('click', EditMenu_click);
    EditMenu.addEventListener('mouseleave', EditMenu_mouseleave);

    editor.addEventListener('mousedown', editor_mousedown);
    editor.addEventListener('mouseup', editor_mouseup);
    editor.addEventListener('mousemove', editor_mousemove);

    const exportPngBtn = document.getElementById("export_png");
    const exportJpegBtn = document.getElementById("export_jpeg");

    if (exportPngBtn) {
        exportPngBtn.addEventListener("click", function () {
            exportAsImage("png");
        });
    } else {
        console.error("Export PNG button not found!");
    }

    if (exportJpegBtn) {
        exportJpegBtn.addEventListener("click", function () {
            exportAsImage("jpeg");
        });
    } else {
        console.error("Export JPEG button not found!");
    }

    const undoButton = document.querySelector('.undo');
    if (undoButton) {
        undoButton.addEventListener('click', function () {
            if (history.length > 0) {
                let lastShape = history.pop();
                lastShape.remove();
                saveDrawing(); 
            }
        });
    } else {
        console.error("Elementul <div class='undo'> nu a fost gasit in DOM!");
    }

   

    //La fiecare reincarcare a paginii, desenul anterior se reincarca
    loadDrawing();
   
}

document.addEventListener('DOMContentLoaded', aplicatie);

//Se adauga evenimentul de stergere pentru elementul selectat
document.addEventListener("keydown", ev => {
    if(elementSelectat && ev.key == "Delete"){
        elementSelectat.remove();
        saveDrawing();
    }
});