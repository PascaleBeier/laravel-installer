@extends('vendor.installer.layouts.master')

@section('title', trans('installer_messages.environment.title'))
@section('style')
    <style>
        .form-control{
            height: 14px;
            width: 100%;
        }
        .has-error{
            color: red;
        }
        .has-error input{
            color: black;
            border:1px solid red;
        }
    </style>
@endsection
@section('container')
    <form method="post" action="{{ route('LaravelInstaller::environmentSave') }}" id="env-form">
        <!-- Datenbankverbindung -->
        <h3>Datenbankverbindung</h3>
        <div class="form-group">
            <label class="col-sm-2 control-label">Hostname</label>
            <div class="col-sm-10">
                <input name="hostname" class="form-control" placeholder="localhost" id="hostname" required>
            </div>
            <p class="help-block">Der Hostname der Datenbank</p>
        </div>
        <div class="form-group">
            <label for="username" class="col-sm-2 control-label">Username</label>
            <div class="col-sm-10">
                <input name="username" class="form-control" placeholder="root" id="username" required>
            </div>
            <p class="help-block">Der Nutzername mit Zugriff auf die Datenbank</p>
        </div>
        <div class="form-group">
            <label for="password" class="col-sm-2 control-label">Password</label>
            <div class="col-sm-10">
                <input type="password" class="form-control" name="password" id="password" required>
            </div>
            <p class="help-block">Das Passwort des obigen Datenbank-Nutzers.</p>
        </div>
        <div class="form-group">
            <label for="database" class="col-sm-2 control-label">Datenbank</label>
            <div class="col-sm-10">
                <input name="database" class="form-control" id="database" placeholder="maengelmelder" required>
            </div>
            <p class="help-block">Der Name der Datenbank.</p>
        </div>

        <!-- Kundenspezifisch -->
        <h3>Kundeninformationen</h3>

        <div class="form-group">
            <label for="client_name" class="col-sm-2 control-label">
                Name
            </label>
            <div class="col-sm-10">
                <input name="client_name" class="form-control" id="client_name" placeholder="Stadt Herten" required>
            </div>
            <p class="help-block">
                Der Name des Kunden - dieser erscheint mitunter auf der Startseite und im Backend.
            </p>
        </div>

        <div class="form-group">
            <label for="client_location" class="col-sm-2 control-label">
                Ort
            </label>
            <div class="col-sm-10">
                <input name="client_location" class="form-control" id="client_location" placeholder="Stadt Herten, Germany" required>
            </div>
            <p class="help-block">
                In diesem Adressbereich nimmt der Kunde Mängel entgegen.
            </p>
        </div>

        <div class="modal-footer">
            <div class="buttons">
                <button class="button" onclick="checkEnv();return false">
                    {{ trans('installer_messages.next') }}
                </button>
            </div>
        </div>
    </form>
    <script>
        function checkEnv() {
            $.easyAjax({
                url: "{!! route('LaravelInstaller::environmentSave') !!}",
                type: "GET",
                data: $("#env-form").serialize(),
                container: "#env-form",
                messagePosition: "inline"
            });
        }
    </script>
@stop
@section('scripts')
    <script src="{{ asset('installer/js/installer.js') }}"></script>
    <script>
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
    </script>
    <script type="text/javascript"
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC-asw5ZiMfmxWTBr0TOkx3lWegR4SHxW4&libraries=places&callback=initAutocomplete"
            async defer></script>
    <script>
        function initAutocomplete() {
            autocomplete = new google.maps.places.Autocomplete(
                (document.getElementById('client_location')),
                {
                    types: ['address'],
                    restrictedComponents: { country: 'de' }
                });
            // When the user selects an address from the dropdown, populate the address
            // fields in the form.
            autocomplete.addListener('place_changed', fillInAddress);
        }
        function fillInAddress() {
            // Get the place details from the autocomplete object.
            var place = autocomplete.getPlace();
            this.value = place.formatted_address;
        }
    </script>
@endsection