/*
 * Параметры вынес в отдельный объект для удобства.
 */
const params = {
    rightSelectID: 'chosen', // chosen-${count}

    buttons: {
        allDeselectButton: {
            text: '<<',
            action: 'allToLeft'
        },
        deselectButton: {
            text: '<',
            action: 'toLeft'
        },
        selectButton: {
            text: '>',
            action: 'toRight'
        },
        allSelectButton: {
            text: '>>',
            action: 'allToRight'
        }
    },

    css: {
        containerClass: 'controller',
        selectClass: 'controller__select',
        optionClass: 'controller__option',
        controlsClass: 'controller__controls',
        buttonClass: 'controller__button'
    }
};

function Controller ( params ) {
    this.count = 0;
    this.leftSelectID = [ '' ]; // leftSelectID[count]
    this.rightSelectID = params.rightSelectID;
    this.buttons = params.buttons;
    this.css = params.css;


    this.handleButtonClick = function ( e ) {
        let moveToSelector = '';
        let optionsSelector = '';
        const count = e.target.dataset.count;

        switch ( e.target.dataset.action ) {
            case this.buttons.allDeselectButton.action:
                optionsSelector = `#${ this.rightSelectID + '-' + count } .${ this.css.optionClass }`;
                moveToSelector = this.leftSelectID[count];
                console.log ( 'All to the Left' );
                break;
            case this.buttons.deselectButton.action:
                optionsSelector = `#${ this.rightSelectID + '-' + count } .${ this.css.optionClass }[selected]`;
                moveToSelector = this.leftSelectID[count];
                console.log ( 'Selected To the Left' );
                break;
            case this.buttons.selectButton.action:
                optionsSelector = `#${ this.leftSelectID[count] } .${ this.css.optionClass }[selected]`;
                moveToSelector = this.rightSelectID + '-' + count;
                console.log ( 'Selected To the Right' );
                break;
            case this.buttons.allSelectButton.action:
                optionsSelector = `#${ this.leftSelectID[count] } .${ this.css.optionClass }`;
                moveToSelector = this.rightSelectID + '-' + count;
                console.log ( 'All To the Right' );
                break;
        }

        const options = document.querySelectorAll ( optionsSelector );
        const moveTo = document.getElementById ( moveToSelector ) || false;

        if ( moveTo && options ) {
            for ( const option of options ) {
                if ( option.hasAttribute ( 'selected' ) ) {
                    option.removeAttribute ( 'selected' );
                }

                moveTo.appendChild ( option );
            }
        }
    };
    this.handleButtonClick = this.handleButtonClick.bind ( this );

    this.handleDoubleClick = function ( e ) {
        let parentID = '';
        const target = e.target;
        const datacount = e.target.parentNode.dataset.count;

        switch ( e.target.parentNode.id ) {
            case this.rightSelectID + '-' + datacount:
                parentID = this.leftSelectID[datacount];
                break;
            default:
                parentID = this.rightSelectID + '-' + datacount;
        }
        if ( target.hasAttribute ( 'selected' ) ) {
            target.removeAttribute ( 'selected' );
        }
        document.getElementById ( parentID ).appendChild ( target );
    };
    this.handleDoubleClick = this.handleDoubleClick.bind ( this );


    this.send = function ( e ) {
        e.preventDefault ();
        const request = [];
        console.log ( 'Count of controllers: ', this.count );
        for ( let i = 1; i <= this.count; i++ ) {
            const options = {
                name: '',
                values: []
            };
            const parent = document.getElementById ( this.rightSelectID + '-' + i );
            options.name = parent.getAttribute ( 'name' );
            const children = parent.children;
            for ( const child of children ) {
                options.values.push ( child.value );
            }
            request.push ( options );
        }
        if (request.length > 0 ) {
            console.log ( 'request: ', JSON.stringify ( request ) );
        }

    };
    this.send = this.send.bind ( this );

    this.init = function ( selectID ) {
        if (
            typeof selectID !== 'string' ||
            !document.getElementById ( selectID ) ||
            document.getElementById ( selectID ).tagName !== 'SELECT'
        ) {
            console.error ( 'ERROR: Init is not complete. Element with ID not found.' );
            return;
        }

        this.leftSelectID.push ( selectID );
        const target = document.getElementById ( selectID );
        const parent = target.parentNode;

        const chosen = this.createSelect ( this.rightSelectID, ++this.count, true, target.name );
        const notChosen = this.createSelect ( this.leftSelectID[this.count], this.count, false );

        for ( const option of target.children ) {
            const newOption = this.createOption ( option );

            option.hasAttribute ( 'selected' ) ? chosen.appendChild ( newOption ) : notChosen.appendChild ( newOption );
        }

        parent.replaceChild ( this.createContainer (
            notChosen,
            this.createControls (),
            chosen
        ), target );
    };

    this.create = async function () {
        let response;
        let data;

        try {
            response = await fetch ( 'appendix_1.json' );
            data = await response.json ();
        }
        catch ( e ) {
            console.error ( 'ERROR: There is a problem with JSON file.' );
            return;
        }
        if (
            !data.hasOwnProperty('id') ||
            !data.hasOwnProperty('data') ||
            data.data.length < 1
        ) {
            console.error ( 'ERROR: Incorrect JSON format.' );
            return;
        }


        this.leftSelectID.push ( data.id );
        const parent = document.getElementsByTagName ( 'form' )[0] || null;
        const submitButton = document.querySelector ( 'button[type="submit"]' );
        if ( !parent ) {
            console.error ( 'ERROR: There is no form tag on the page.' );
            return;
        }

        const chosen = this.createSelect ( this.rightSelectID, ++this.count, true, data.name );
        const notChosen = this.createSelect ( this.leftSelectID[this.count], this.count, false );

        for ( const option of data.data ) {
            const newOption = this.createOption ( option );
            option.hasOwnProperty ( 'selected' ) ? chosen.appendChild ( newOption ) : notChosen.appendChild ( newOption );
        }

        parent.insertBefore ( this.createContainer (
            notChosen,
            this.createControls (),
            chosen
        ), submitButton );
    };
}

Controller.prototype.createButton = function ( text, handleClick, action, count ) {
    const button = document.createElement ( 'button' );
    button.classList.add ( this.css.buttonClass );
    button.textContent = text;
    button.setAttribute ( 'type', 'button' );
    button.dataset.action = action;
    button.dataset.count = count;
    button.onclick = handleClick;

    return button;
};

Controller.prototype.createControls = function () {
    const container = document.createElement ( 'div' );
    container.classList.add ( this.css.controlsClass );

    const buttons = this.buttons;


    for ( const key in buttons ) {
        if ( buttons.hasOwnProperty ( key ) ) {
            container.appendChild (
                this.createButton (
                    buttons[key].text || 'button',
                    this.handleButtonClick,
                    buttons[key].action || '',
                    this.count
                )
            );
        }
    }

    return container;
};

Controller.prototype.createOption = function ( option ) {
    const newOption = document.createElement ( 'div' );

    newOption.classList.add ( this.css.optionClass );
    newOption.value = option.value || 'no value';
    newOption.textContent = option.textContent || newOption.value;
    newOption.onclick = function () {
        this.toggleAttribute ( 'selected' );
    };

    newOption.ondblclick = this.handleDoubleClick;

    return newOption;
};

Controller.prototype.createSelect = function ( selectID, count, withCount, name ) {
    const select = document.createElement ( 'div' );
    select.classList.add ( this.css.selectClass );
    select.id = withCount ? selectID + '-' + count : selectID;
    select.dataset.count = count;
    select.setAttribute ( 'name', name ? name : 'controller' + this.count );
    select.setAttribute ( 'multiple', '' );

    return select;
};

Controller.prototype.createContainer = function ( notChosen, buttons, chosen ) {
    const container = document.createElement ( 'div' );
    container.classList.add ( this.css.containerClass );

    container.appendChild ( notChosen );
    container.appendChild ( buttons );
    container.appendChild ( chosen );

    return container;
};


/*
 * Метод init() заменяет любой указанный select, простой или multiple.
 * Принимает ID от select'а, который надо заменить.
 * Принимает аргумент только типа string.
 * Если элемента не существует, функция прекратит работу.
 * Если ID не от select, функция прекратит работу.
 * Корректно обрабатывает множество select.
 *
 * У select обязательные параметры ID, name.
 * Если отсутствует name, подставляется 'controller'.
 *
 * У option обязательно должен быть value.
 * Если отсутствует value, подставляется 'no value'.
 * Если option нет, select будет пустым.
 *
 * Метод create() добавляет в форму 1 контроллер.
 * На странице должна быть хотя бы 1 тэг form.
 *
 * Метод send() назначается свойству window.onsubmit.
 * Метод send обрабатывает правые select и формирует JSON для отправки.
 */

const ctrl = new Controller ( params );
ctrl.init ( 'select1' );
ctrl.init ( 'select2' );
ctrl.create ();
window.onsubmit = ctrl.send;


