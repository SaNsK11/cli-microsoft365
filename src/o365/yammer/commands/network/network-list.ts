import commands from '../../commands';
import GlobalOptions from '../../../../GlobalOptions';
import {
  CommandOption, CommandValidate
} from '../../../../Command';
import YammerCommand from "../../../base/YammerCommand";
import request from '../../../../request';

const vorpal: Vorpal = require('../../../../vorpal-init');

interface CommandArgs {
  options: Options;
}

interface Options extends GlobalOptions {
  includeSuspended: boolean;
}

class YammerNetworkListCommand extends YammerCommand {
  public get name(): string {
    return `${commands.YAMMER_NETWORK_LIST}`;
  }

  public get description(): string {
    return 'Returns a list of networks to which the current user has access';
  }

  public getTelemetryProperties(args: CommandArgs): any {
    const telemetryProps: any = super.getTelemetryProperties(args);
    telemetryProps.includeSuspended = args.options.includeSuspended;
    return telemetryProps;
  }

  public commandAction(cmd: CommandInstance, args: CommandArgs, cb: () => void): void {
    const requestOptions: any = {
      url: `${this.resource}/v1/networks/current.json`,
      headers: {
        accept: 'application/json;odata.metadata=none',
        'content-type': 'application/json;odata=nometadata'
      },
      json: true,
      body: {
        includeSuspended: args.options.includeSuspended !== undefined && args.options.includeSuspended !== false
      }
    };

    request
      .get(requestOptions)
      .then((res: any): void => {
        if (args.options.output === 'json') {
          cmd.log(res);
        }
        else {
          cmd.log((res as any[]).map(n => ({ id: n.id, name: n.name, email: n.email, community: n.community, permalink: n.permalink, web_url: n.web_url })));
        }
        cb();
      }, (err: any): void => this.handleRejectedODataJsonPromise(err, cmd, cb));
  }

  public options(): CommandOption[] {
    const options: CommandOption[] = [
      {
        option: '--includeSuspended',
        description: 'Include the networks in which the user is suspended'
      }
    ];

    const parentOptions: CommandOption[] = super.options();
    return options.concat(parentOptions);
  }

  public validate(): CommandValidate {
    return (args: CommandArgs): boolean | string => {
      return true;
    };
  }

  public commandHelp(args: {}, log: (help: string) => void): void {
    log(vorpal.find(this.name).helpInformation());
    log(
      `  Examples:
  
    Returns the current user's networks
      ${this.name} list

    Returns the current user's networks including the networks in which the user
    is suspended
      ${this.name} list --includeSuspended
    `);
  }
}

module.exports = new YammerNetworkListCommand();