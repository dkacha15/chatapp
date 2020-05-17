import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;

  constructor(private fb: FormBuilder, private userService: UsersService) {}

  ngOnInit(): void {
    this.Init();
  }

  Init() {
    this.passwordForm = this.fb.group(
      {
        cpassword: ['', Validators.required],
        newpassword: ['', Validators.required],
        confirmpassword: ['', Validators.required],
      },
      {
        validator: this.validate.bind(this),
      }
    );
  }

  changePassword() {
    this.userService.changePassword(this.passwordForm.value).subscribe(
      (data) => {
        // console.log(data);
        // this.passwordForm.reset();
      },
      (err) => console.log(err)
    );
  }

  validate(passwordFormGroup: FormGroup) {
    const new_password = passwordFormGroup.controls.newpassword.value;
    const confirm_password = passwordFormGroup.controls.confirmpassword.value;

    if (confirm_password.length <= 0) {
      return null;
    }

    if (confirm_password !== new_password) {
      return {
        doesNotMatch: true,
      };
    }

    return null;
  }
}
