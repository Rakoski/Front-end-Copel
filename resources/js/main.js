let selectedCep = null;

function RegistrarEndereco() {
  let endereco = {}

  endereco.cep = $("#cep").val();
  endereco.numero = $("#numero").val();

   $.ajax({
     type: "POST",
     url: "http://localhost:8080/api/endereco/registrar",
     data: JSON.stringify(endereco),
     contentType: "application/json; charset=utf-8",
     dataType: "json",
     success: function (msg) {
      sessionStorage.setItem('cep', endereco.cep);
     },
     error: function (msg) {
      sessionStorage.setItem('cep', endereco.cep);
     }

   });
};

function Registrar() {
  RegistrarEndereco();

  let emailpassword = {}

  emailpassword.nome = $("#Name").val();
  emailpassword.sobrenome = $("#lastname").val();
  emailpassword.password = $("#password").val();
  emailpassword.email = $("#email").val();

    $.ajax({
        type: "POST",
        url: "http://localhost:8080/api/aluno/registrar",
        data: JSON.stringify(emailpassword),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            alert('Sucesso!');
            window.location.href = "login.html";
        },
        error: function (msg) {
          window.location.href = "login.html";
        }

    });
};

function login() {
  var emailpassword = {}

  emailpassword.password = $("#password").val();
  emailpassword.email = $("#email").val();

  $.ajax({
    type: "POST",
    url: "http://localhost:8080/api/aluno/login",
    data: JSON.stringify(emailpassword),
    contentType: "application/json; charset=utf-8",
    dataType: "text",
    success: function (data) {
      console.log("entrou!")
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
  if (sessionStorage.getItem('validado') != undefined || null) {
    const email = sessionStorage.getItem('email')
    getUserInfoByEmail(email, function (userInfo) {
      $("#setUserName").html('<img src="./resources/img/profile.png" class="profile-icon"> <span class="d-none-md d-inlineblock" style="margin-right: 8px"></span> ' + userInfo.nome + ' ' + userInfo.sobrenome)
    });
    if (sessionStorage.getItem('CursoSelectedId') == undefined || null) {
      getUserIDByEmail(email, function (userID) {
        sessionStorage.setItem('ID', userID);
        getCepsByUserID(userID, function (conta) {
          setSelectedCurso(conta[0]);
          $("#fodase").html(conta[0] + ' <i class="glyphicon glyphicon-refresh"></i> ');
        })
      });
    } else {
      const selectedCep = sessionStorage.getItem('CursoSelectedId');
      $("#fodase").html(selectedCep + ' <i class="glyphicon glyphicon-refresh"></i> ');
    }
  } else {
    sessionStorage.clear();
    window.location.href = "login.html";
    return false;
  }
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



// Lista Disciplina (Menu Superior)
function ListarConta() {
  const email = sessionStorage.getItem('email')
  getUserIDByEmail(email, function(userid){
    getCepsByUserID(userid, function (conta){
      for(var i = 0; i < 1; i++){
          AdicionarLinhaTabela(
            conta,
            conta,
            true
          );
      }
    });
  });
}

function changeCurso(curso_id, curso_nome) {
  selectedCep = curso_nome;
  sessionStorage.setItem('CursoSelectedId', curso_nome);
  $("#fodase").html(selectedCep + ' <i class="glyphicon glyphicon-refresh"></i> ');
}


function AdicionarLinhaTabela(idConta, cep, addBotao = false) {
  for (var i = 0; i < idConta.length; i++) {
    var linhaNova = '<tr id="Linha' + idConta[i] + '">' +
                    '<td>' + cep[i] + '</td>';
    if (addBotao) {
      linhaNova += '<td class="btn-col"><a href="#" onclick="javascript:changeCurso(' + idConta[i] + ', \'' + cep[i] + '\');"> Selecionar</a></td>';
    }
    linhaNova += '</tr>';
    $("#ListaCadastro tbody").prepend(linhaNova);
  }
  $('#myModal').modal().hide();
}



function ListarDisciplinas(usuario_id) {
  const curso_id = sessionStorage.getItem('CursoSelectedId')
    getDisciplinasByCursoID(curso_id, usuario_id, function(disciplinas){
      for(var i = 0; i < disciplinas.length; i++){
        console.log(disciplinas)
        console.log(disciplinas[i].nome_disciplina);
        getDisciplinasByUserID(
          disciplinas.usuario_id, 
          disciplinas[i].idDisciplinas, 
          disciplinas[i].nomeDisciplina, 
          disciplinas[i].professor, 
          function(OBJ){
            AdicionarLinhaTabelaDisciplinas(
              OBJ.disciplina_id,
              OBJ.disciplina_nome,
              OBJ.disciplina_professor,
              OBJ.status_disciplina,
              OBJ.nota
            );
          }
        );
      }

    });
}

function AdicionarLinhaTabelaDisciplinas(disciplina_id, disciplina_nome, disciplina_professor, status_disciplina, nota) {
  var linhaNova = '<tr id="Linha' + disciplina_id + '">'+
                      '<td>' + disciplina_nome + '</td>'+
                      '<td>' + disciplina_professor + '</td>';
  if(nota != null) {
    linhaNova += '<td>'+ nota +'</td>';
  } else{
    linhaNova += '<td >-</td>'
  }
  if (status_disciplina == 'APROVADO'){
    linhaNova += '<td class="disc-obs aproved">'+ status_disciplina +'</td>';
  } else if (status_disciplina == 'REPROVADO'){
    linhaNova += '<td class="disc-obs reproved">'+ status_disciplina +'</td>';
  } else {
    linhaNova += '<td >'+ status_disciplina +'</td>';
  }
    linhaNova += '</tr>';

  $("#ListarDisciplinas tbody").prepend(linhaNova);
  $('#myModal').modal().hide();
};

function ListarProtocolos(usuario_id, curso_id){
  getProtocoloByUser(usuario_id, curso_id, function(protocolos){
    var OBJ
    for(var i = 0; i < protocolos.length; i++){
        OBJ = {
          "id_protocolo": protocolos[i][0],
          "id_usuario": protocolos[i][9],
          "id_curso": protocolos[i][1],
          "protocolo_typeID" : protocolos[i][8],
          "protocolo_status" : protocolos[i][7],
          "protocolo_etapa" : protocolos[i][5],
          "protocolo_setor" : protocolos[i][6],
          "protocolo_campo" : protocolos[i][2],
          "protocolo_docpath" : protocolos[i][3],
          "protocolo_docreturn" : protocolos[i][4],
          "protocolo_nome": null
        }
        getProtocoloTypeByID(protocolos[i][8], OBJ, function(data){
          AdicionarLinhaTabelaProtocolos(data);
        })
    }
  });
};

function AdicionarLinhaTabelaProtocolos(PROTOCOLO){
  var linhaNova = '<tr id="Linha' + PROTOCOLO.id_protocolo + '">'+
                    '<td style="padding: 18px 8px">' + PROTOCOLO.id_protocolo + '</td>' +
                    '<td style="padding: 18px 8px">' + PROTOCOLO.protocolo_nome + '</td>' +
                    '<td style="width: 80px; text-align: right; padding: 18px 10px">' + PROTOCOLO.protocolo_status + '</td>'+
                    '<td class="btn-col"><a href="#" onClick="javascript:verProtocolo('+ PROTOCOLO.id_protocolo +')">VER</a></td>'
      linhaNova +='</tr>'

  $("#ListarProtocolos tbody").prepend(linhaNova);
  $('#myModal').modal().hide();
}

function verProtocolo(id_protocolo){
  getProtocoloByID(id_protocolo, function(PROTOCOLO){
    getProtocoloTypeByID(PROTOCOLO.protocoloTypeId, PROTOCOLO, function(PROTOCOLO){
      console.log(PROTOCOLO)
      $( "#openProtocolo" ).addClass( "show" );
      $('#protocolo_id').text('Protocolo #'+PROTOCOLO.id_protocolo);
      $('#protocolo_nome').text(PROTOCOLO.protocolo_nome);
      $('#protocolo_status').text(PROTOCOLO.protocoloStatus);
      $('#protocolo_setor').text(PROTOCOLO.protocoloSetor);
      $('#protocolo_etapa').text(PROTOCOLO.protocoloEtapa + '/' + PROTOCOLO.protocoloEtapa);
      $('#protocolo_campo').text(PROTOCOLO.protocoloCampo);
      $('#protocolo_nome').text(PROTOCOLO.protocolo_nome);

      
      if(PROTOCOLO.protocoloDocpath != null){
        $("#protocolo-file" ).addClass( "btn-col" );
        $('#protocolo-file').html('<a href="'+ PROTOCOLO.protocoloDocpath + '" target="_blank">Acessar</a>');
      }
      
      if(PROTOCOLO.protocoloDocreturn != null){
        $("#protocolo-return" ).addClass( "btn-col" );
        console.log('protocoloDocreturn = ' + PROTOCOLO.protocoloDocreturn)
        $('#protocolo-return').html('<a href="'+ PROTOCOLO.protocoloDocreturn + '" target="_blank">Acessar</a>');
      }

      getCursoInfoByID(PROTOCOLO.cursoId, null, function(CURSO){
        $('#protocolo_curso').text(CURSO.nome);
      });

    })
  });
}
function closeProtocolo(){
  $( "#openProtocolo" ).removeClass( "show" );
}

function getSelectedCurso(){
  return {
    "user_id": sessionGet('ID'),
    "curso_id": sessionGet('CursoSelectedId'),
    "curso_nome": sessionGet('cursoSelectedNome'),
    "curso_status": sessionGet('cursoSelectedStatus')
  }
}

function setSelectedCurso(idConta,){
  sessionStorage.setItem('CursoSelectedId', idConta);
  sessionStorage.setItem('cursoSelectedNome', idConta);
  sessionStorage.setItem('cursoSelectedStatus', idConta);
}


function sessionGet(chave){
  return sessionStorage.getItem(chave)
}

// Retorna ID do Usuário através do EMAIL
function getUserIDByEmail(email, callback){
  $.ajax({
      type: "GET",
      url: "http://localhost:8080/api/aluno/encontre/" + email,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data) {
        callback(data.idCliente);
      },
      error: function () {
        console.error("Error loading1");
      },
  });
}

// Retorna os Dados do Usuário através do EMAIL
function getUserInfoByEmail(email, callback){
  $.ajax({
      type: "GET",
      url: "http://localhost:8080/api/aluno/encontre/" + email,
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
        url: "http://localhost:8080/api/endereco/encontre-todos-ceps/" + id_user,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {

          callback(data)
        },
        error: function () {
          console.error("Error loading2.5");
        },
    });
}

function getContaStatusByUserCurso(usuario_id, idConta, callback){
  getCursoUsuarioByUserID(usuario_id, function (conta){
    for(var i = 0; i < conta.length; i++){
      console.log(conta)
      if(conta[i][1] == idConta){
        callback(conta[i][0])
      }
    }
    callback(null)
  });
}


function getContaInfoByID(id, statusPagamento = null, callback){
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/api/conta/conta-info/" + id,
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