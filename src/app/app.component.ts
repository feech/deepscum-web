import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
    title = 'app XX';


    private imageId: string ='2';
    private imageSrc: string;

    private imageTypes: string[] = ['start', 'mid', 'finish', 'none'];
    private imageTypeValue: string;
    private componentsType: string[] = ['text input', 'checkbox', 'radio', 'next button', 'scrolling', 'show more', 'back button', 'check text', 'select', 'select-list'];
    private colors: string[] = ['black', 'blue', 'brown', 'red', 'green', 'MediumSeaGreen'];
    private currentComponent: string;
    private rLeft: number;
    private rTop: number;
    private imageLoaded: boolean = false;

    private state: number = 0;
    private iw: string = '100%';
    private il: string = '0';
    private it: string = '0';
    private iln: number = 0;
    private itn: number = 0;

    @ViewChild('paintbox') 
    public canvas: ElementRef;
    private cx: CanvasRenderingContext2D;  
  
  
    private left() {
        console.log('<<<<');
        this.imageId = (parseInt(this.imageId)-1).toString();
        this.loadImage(this.imageId);
    }
    private right() {
        console.log('>>>>');
        this.imageId = (parseInt(this.imageId)+1).toString();
        this.loadImage(this.imageId);
    }
    private goto() {
        console.log(`go ${this.imageId}`);
        this.loadImage(this.imageId);
    }

    constructor(private http: HttpClient) { }
    ngOnInit() {
        this.http.get('/api/screen-number')
            .subscribe(data => {
                this.imageId = data.toString();
                this.loadImage(this.imageId);
                }
            );
    }

    private setClass(type: string) {
        this.http.post(`/api/image/${this.imageId}/class?class=${type}`, {})
            .subscribe(data => console.log(data));
    }

    private loadImage(id) {
        this.resetImageView();
        this.imageLoaded = false;
        this.cx.clearRect(0,0,1024,768);
        this.http.get(`/api/image/${id}/info`)
            .subscribe(data => {
                console.log(data);
                this.imageTypeValue = data['class']||'none';
                console.log('class is', this.imageTypeValue);
                if(data['input']){
                    this.paintImgs(JSON.parse(data['input']));
                    this.imageLoaded = true;
                    console.log('loaded')
                }
            })
    }

    private paintImgs(li: any[]) {
        if(!li) {
            return;
        }
        for (let l of li) {
                this.cx.fillStyle = this.getColor(l.component);
                if (l.l && l.t && l.w && l.h) {
                    this.cx.fillRect(l.l, l.t, l.w, l.h);
                    
                }else if (l.x && l.y && l.w && l.h) {
                    this.cx.fillRect(+l.x+ l.w/2- +l.w, +l.y+ l.h/2- +l.h, l.w, l.h);
                }

                if(l.x && l.y) {
                    this.cx.fillStyle = 'black';
                    this.cx.fillRect(l.x-3, l.y-3, 7,7);
                    // this.cx.arc(l.x, l.y, 3, 0, 3*Math.PI);
                    // this.cx.strokeStyle='black';
                    // this.cx.stroke();
                }
        }

    }
    // get latestNumber(): string {
    //     return this.http.get('/api/screen-number');
    // }

    private dummy(x: any) {

    }

    private getColor(component: string): string {
        // return 'red';
        return this.colors[this.componentsType.indexOf(component)];
    }

    private eventHandlerClick(s: MouseEvent) {


    }

    private resetImageView() {
            this.state =0;
            this.iw='100%';
            this.il='0';
            this.it='0';
        
    }

    // from scaled to normal
    private ccX(l:number): number{
        return Math.floor((-this.iln+l)/6+0.5);
    }
    private ccY(l:number): number{
        return Math.floor((-this.itn+l)/6+0.5);
    }

    // from normal to scaled
    private rcX(l:number): number {
        return (l*6)-this.iln;
    }
    private rcY(l:number): number {
        return (l*6)-this.itn;
    }

    private mouseDownHandler(s: MouseEvent) {
                
        if(this.state == 0) {
            this.state =1;
            this.iw='600%';
            this.iln=-5*s.offsetX;
            this.itn=-5*s.offsetY;
            this.il=this.iln+'px';
            this.it=this.itn+'px';
        }
        if (this.state==2) {
            this.rLeft = s.offsetX;
            this.rTop = s.offsetY;
        }
            // console.log(s.offsetX, s.offsetY);
        // console.log(`+++ Click ${s.offsetX} ${s.offsetY} ${this.currentComponent}`);
    }
    private mouseUpHandler(s: MouseEvent) {
        let onlyScaled = false;
        if (this.state==1) {
            this.state=2;
            onlyScaled = true;
            // return;
        }
        if(this.state!=2) {
            return;
        }
        // console.log(`+++ Click ${s.offsetX} ${s.offsetY} ${this.currentComponent}`);
        if(!this.currentComponent) {
            return;
        }

        let l, t, w, h;

        if (onlyScaled) {
            l = s.offsetX;
            t = s.offsetY;
            w = 0;
            h = 0;
        }
        else {
            l=Math.min(this.rLeft, s.offsetX);
            t=Math.min(this.rTop, s.offsetY);
            w=Math.abs(s.offsetX-this.rLeft);
            h=Math.abs(s.offsetY-this.rTop);
        }



        console.log('inp event', l,t,(-this.iln+l),Math.floor((-this.iln+l)/6+0.5));
        let params;
        if(w==0 && h == 0){
            params = {x: this.ccX(l), y: this.ccY(t), component: this.currentComponent};
        }
        else {
            params = {l: this.ccX(l), t: this.ccY(t), w: Math.floor(w/6+0.5), h: Math.floor(h/6+0.5), component: this.currentComponent};

        }

        console.log(params);
        // var params;

        // if (['checkbox', 'radio'].includes(this.currentComponent)) {
        //     var dim = Math.max(w,h)
        //     params = {x: this.rLeft, y: this.rTop, w: 2*dim+1, h: 2*dim+1, component: this.currentComponent};
        // }
        // else {
        //     if (w>5 || h>5){
        //         params = {l: l, t: t, w: w+1, h: h+1, component: this.currentComponent};
                
        //     }
        //     else
        //     {
        //         params = {x: this.rLeft, y: this.rTop};
        //     }
            
        // }

        this.http.post(`/api/image/${this.imageId}/input`, params)
            .subscribe(data => {
                this.cx.fillStyle = this.getColor(this.currentComponent);
                this.cx.fillRect(l, t, w, h);
            });
    }



    private eraseLast() {
        this.http.delete(`/api/image/${this.imageId}/input`)
            .subscribe(data => {
                console.log("deleted");
            });

    }
    public ngAfterViewInit() {
        // get the context
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl.getContext('2d');
        // this.cx.fillStyle = 'rgb(200,0,0)';
    }

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) { 
        //this.key = event.key;
        console.log(event.key, event.key=='Enter');

        if(event.key=='Enter') {
            this.resetImageView();
        }
    }
}
