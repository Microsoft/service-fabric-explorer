import { Pipe, PipeTransform } from '@angular/core';
import { IUnhealthyEvaluationNode } from 'src/app/Utils/healthUtils';

@Pipe({
  name: 'unhealtyEvaluationChildFilter'
})
export class UnhealtyEvaluationChildFilterPipe implements PipeTransform {

  transform(children: IUnhealthyEvaluationNode[], errorOnly: boolean): IUnhealthyEvaluationNode[] {
    if (errorOnly) {
      return children.filter(child => child.containsErrorInPath);
    }else{
      return children;
    }
  }

}
