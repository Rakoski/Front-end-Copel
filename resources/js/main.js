let selectedCep = null;
let SelectedCepId = null;


function getUserIDByEmail(email, callback){
  console.log(email)
  $.ajax({
      type: "GET",
      url: "http://localhost:8080/api/cliente/encontre/" + email,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data) {
        console.log(data)
        callback(data.idCliente);
      },
      error: function (error) {
        console.error("Erro ao pegar o id do usuário pelo email: " + error);
      },
  });
}

function RegistrarEndereco() {

  let endereco = {}
  endereco.cep = $("#cep").val();
  endereco.numero = $("#numero").val();
  const tamanho_maximo_do_cep = 5

  function ehUmCepValido(cep) {
    const cepPattern = /^\d{5}-\d{3}$/;
    return cepPattern.test(cep);
  }
  
  if (!ehUmCepValido(endereco.cep)) {
    alert("Formato de CEP Inválido!'.");
    return;
  }


  if (endereco.numero.length > tamanho_maximo_do_cep) {
    alert("Números podem ter até 5 caracteres.");
    return; 
  }

    $.ajax({
      type: "POST",
      url: "http://localhost:8080/api/endereco/registrar",
      data: JSON.stringify(endereco),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (msg) {
       console.log("sucesso!")
      },
      error: function (msg) {
       console.log("um erro ocorreu no registro do endereço: " + msg)
      }
 
    });

} 

function pegaIdDoEnderecoComBaseNoCep(callback) {
  const cep = $("#cep").val();
  const encodedCep = encodeURIComponent(cep);

  $.ajax({
    type: "GET",
    url: `http://localhost:8080/api/endereco/encontre-pelo-cep/${encodedCep}`,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      callback(data);
    },
    error: function (error) {
      console.error("Um erro ocorreu ao pegar o endereço com base no cep:", error);
    },
  });
}


function RegistrarCliente() {

  let emailpassword = {}

  emailpassword.nome = $("#Name").val();
  emailpassword.sobrenome = $("#lastname").val();
  emailpassword.password = $("#password").val();
  emailpassword.email = $("#email").val();

    $.ajax({
        type: "POST",
        url: "http://localhost:8080/api/cliente/registrar",
        data: JSON.stringify(emailpassword),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            console.log('Sucesso!');
        },
        error: function (error) {
          console.log("ocorreu um erro no registro do cliente: " + error)
        }

    });
};

function RegistraClienteComSeuEndereco() {
  RegistrarEndereco();
  RegistrarCliente();

  let emailHash = {}

  emailHash.email = $("#email").val();

  getUserIDByEmail(emailHash.email, function (userId) {
    pegaIdDoEnderecoComBaseNoCep(function (enderecoIds) {
        const clienteEndereco = {
          clienteId: userId,
          enderecoId: enderecoIds[0], 
        };

        $.ajax({
          type: "POST",
          url: "http://localhost:8080/api/cliente-endereco/registrar",
          data: JSON.stringify(clienteEndereco),
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function () {
            window.location.href = 'login.html'
          },
          error: function () {
            window.location.href = 'login.html'
          }
        });
    });
  });
}


function login() {
  var emailpassword = {}

  emailpassword.password = $("#password").val();
  emailpassword.email = $("#email").val();

  $.ajax({
    type: "POST",
    url: "http://localhost:8080/api/cliente/login",
    data: JSON.stringify(emailpassword),
    contentType: "application/json; charset=utf-8",
    dataType: "text",
    success: function (data) {
      sessionStorage.setItem('email', emailpassword.email);
      sessionStorage.setItem('password', emailpassword.password);
      getUserIDByEmail(emailpassword.email, function(userID){
        sessionStorage.setItem('ID', userID);
      })
      sessionStorage.setItem('validado', true)
      window.location.href = `home.html`;
    },
    error: function (errorThrown) {
      console.error('Login error:', errorThrown);
      alert('Login falhou, por favor verifique seu email e senha.');
    }
  });
}

function logout(){
  sessionStorage.clear();
  window.location.href = `login.html`;
}

function validaUser() {
  if (isUserValidated()) {
    const email = getSessionEmail();
    updateUserName(email);
    updateCep();
  } else {
    clearSessionAndRedirectToLogin();
  }
}

function isUserValidated() {
  const validated = sessionStorage.getItem('validado');
  return validated !== undefined && validated !== null;
}

function getSessionEmail() {
  return sessionStorage.getItem('email');
}

function updateUserName(email) {
  getUserInfoByEmail(email, function (userInfo) {
    const fullName = `${userInfo.nome} ${userInfo.sobrenome}`;
    $("#setUserName").html(`<img src="./resources/img/profile.png" class="profile-icon"> <span class="d-none-md d-inlineblock" style="margin-right: 8px"></span> ${fullName}`);
  });
}

function updateCep() {
  const selectedCep = sessionStorage.getItem('CepSelectedNumero');
  if (selectedCep === undefined || selectedCep === null) {
    const email = getSessionEmail();
    getUserIDByEmail(email, function (userID) {
      sessionStorage.setItem('ID', userID);
      getCepsByUserID(userID, function (cep) {
        const firstCep = cep[0].split(',')[1].trim();
        setSelectedCep(firstCep);
        $("#fodase").html(`${firstCep} <i class="glyphicon glyphicon-refresh"></i>`);
      });
    });
  } else {
    $("#fodase").html(`${selectedCep} <i class="glyphicon glyphicon-refresh"></i>`);
  }
}

function clearSessionAndRedirectToLogin() {
  sessionStorage.clear();
  window.location.href = "login.html";
}



// function getQueryParams() {
//   const params = {};
//   const search = window.location.search.substring(1);
//   const queryParams = search.split("&");
//   for (const param of queryParams) {
//     const [key, value] = param.split("=");
//     params[key] = decodeURIComponent(value);
//   }
//   return params;
// };


function ListarCeps() {
  const email = sessionStorage.getItem('email')
  getUserIDByEmail(email, function(userid){
    getCepsByUserID(userid, function (conta){
      for(var i = 0; i < 1; i++){
          AdicionarLinhaTabela(
            conta,
            true
          );
      }
    });
  });
}

function ListarContaDeLuz() {
  const idEndereco = sessionStorage.getItem('E')
}

function changeCep(fullData) {
  
  const parts = fullData.split(',');
  const id = parts[0];
  const cep = parts[1];
  const numero = parts[2];

  // Nós só queremos mostrar o cep e o número da rua pra pessoa, caso ela queira muda-lo, não precisa mostrar o id
  selectedCep = cep;
  sessionStorage.setItem('CepSelectedNumero', cep);
  sessionStorage.setItem('CepSelectedId', id)
  sessionStorage.setItem('CepSelectedIdNumeroRua', numero)
  $("#fodase").html(selectedCep + ' <i class="glyphicon glyphicon-refresh"></i> ');
}

function AdicionarLinhaTabelaConta(contaData) {

}

function AdicionarLinhaTabela(cepData, addBotao = false) {
  for (var i = 0; i < cepData.length; i++) {
    const fullData = cepData[i];
    const parts = fullData.split(',');
    const cep = parts[1];
    const numeroEndereco = parts[2]

    var linhaNova = '<tr id="Linha">' +
                    '<td>' + cep + '</td>' +
                    '<td>' + numeroEndereco + '</td>';
    if (addBotao) {
      linhaNova += '<td class="btn-col"><a href="#" onclick="javascript:changeCep(\'' + fullData + '\');"> Selecionar</a></td>';
    }
    linhaNova += '</tr>';
    $("#ListaCadastro tbody").prepend(linhaNova);
  }
  $('#myModal').modal().hide();
}

function AdicionarLinhaTabelaContas(contaData, addBotao = false) {
  for (var i = 0; i < contaData.length; i++) {
      const data = contaData[i];

      var newRow = '<tr id="Linha">' +
          '<td>' + data.contaId + '</td>' +
          '<td>' + data.cliente + '</td>' +
          '<td>R$ ' + data.valorAPagar.toFixed(2) + '</td>';

      const date = new Date(data.dataDeVencimento);
      newRow += '<td>' + date.toLocaleDateString() + '</td>';

      newRow += '<td>' + data.statusPagamento + '</td>' +
          '<td>' + data.kilowattsHora + '</td>';

      if (addBotao) {
          newRow += '<td class="btn-col"><a href="#" onclick="javascript:changeCep(\'' + JSON.stringify(data) + '\');">Selecionar</a></td>';
      }
      newRow += '</tr>';

      $("#table-body").prepend(newRow);
  }

  if (addBotao) {
      $('#myModal').modal('hide');
  }
}

getContaInfoByIDEndereco(sessionStorage.getItem('ID'), null, AdicionarLinhaTabelaContas);


function getSelectedCurso(){
  return {
    "user_id": sessionGet('ID'),
    "curso_id": sessionGet('CepSelectedNumero'),
  }
}

function setSelectedCep(idConta){
  sessionStorage.setItem('CepSelectedNumero', idConta);
  sessionStorage.setItem('cursoSelectedNome', idConta);
  sessionStorage.setItem('cursoSelectedStatus', idConta);
}


function sessionGet(chave){
  return sessionStorage.getItem(chave)
}

function getUserInfoByEmail(email, callback){
  $.ajax({
      type: "GET",
      url: "http://localhost:8080/api/cliente/encontre/" + email,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data) {
        callback(data);
      },
      error: function () {
        console.error("Error loading2");
      },
  });
}

function getCepsByUserID(id_user, callback){
  $.ajax({
      type: "GET",
      url: "http://localhost:8080/api/cliente-endereco/encontre-todos-ceps/" + id_user,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data) {
        const cepData = []; 
  
        for (let i = 0; i < data.length; i++) {
          const parts = data[i].split(','); 
          const cep = parts[1].trim(); 
          const idCep = parts[0].trim();
          cepData.push(data[i]); 
        }
        
        callback(cepData); 
      },
      error: function () {
        console.error("Error loading2.5");
      },
  });
}


function getContaStatusByUserCurso(usuario_id, idConta, callback){
  getCursoUsuarioByUserID(usuario_id, function (conta){
    for(let i = 0; i < conta.length; i++){
      if(conta[i][1] == idConta){
        callback(conta[i][0])
      }
    }
    callback(null)
  });
}


function getContaInfoByIDEndereco(id, statusPagamento = null, callback){
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/api/conta/conta-endereco/" + id,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
          data.idConta = id;
          if(statusPagamento != null){
            data.statusPagamento = statusPagamento;
          }
          callback(data);
        },
        error: function () {
          console.error("Error loading3");
        },
    });
}

function togglePasswordVisibility() {
  var passwordInput = document.getElementById("password");
  var passwordToggle = document.querySelector(".c46ddf851 ulp-button-icon");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    passwordToggle.querySelector(".show-password-tooltip").classList.add("hide");
    passwordToggle.querySelector(".hide-password-tooltip").classList.remove("hide");
    passwordToggle.querySelector(".password-toggle-label[data-label='show-password']").classList.add("hide");
    passwordToggle.querySelector(".password-toggle-label[data-label='hide-password']").classList.remove("hide");
  } else {
    passwordInput.type = "password";
    passwordToggle.querySelector(".show-password-tooltip").classList.remove("hide");
    passwordToggle.querySelector(".hide-password-tooltip").classList.add("hide");
    passwordToggle.querySelector(".password-toggle-label[data-label='show-password']").classList.remove("hide");
    passwordToggle.querySelector(".password-toggle-label[data-label='hide-password']").classList.add("hide");
  }
}
