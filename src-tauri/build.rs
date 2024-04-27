//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

fn main() {
  tauri_build::build();
  //  if let Err(error) = tauri_build::try_build(tauri_build::Attributes::default()){
  //   if let Ok(env) = std::env::var("TAURI_CONFIG") {
  //     panic!("error found during tauri-build: {}", env);
  //   }else{
  //     println!("111111");
  //   }
  //   println!("{:?}",error)
  // }
}
