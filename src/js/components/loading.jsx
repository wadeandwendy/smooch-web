import React, { Component } from 'react';

export class LoadingComponent extends Component {
    render() {
        const classNames = ['CLASS_PREFIX-fading-circle'];
        const {color, dark, style} = this.props;
        const innerCircleStyle = { };

        if (dark) {
            classNames.push('dark');
        }

        if (color) {
            innerCircleStyle.backgroundColor = `#${this.props.color}`;
        }

        const circles = [];

        for (let i = 1; i < 13; i++) {
            circles.push(<div className={ `CLASS_PREFIX-circle${i} CLASS_PREFIX-circle` }
                              key={ i }>
                             <div className='CLASS_PREFIX-inner-circle'
                                  style={ innerCircleStyle } />
                         </div>);
        }

        return <div style={ style }
                    className={ classNames.join(' ') }>
                   { circles }
               </div>;
    }
}
